#!/usr/bin/env node
import fs from "node:fs";

const targetFile=process.argv[2]||"production-data/v4/runtime/vertical_slice_economy_targets.json";
const spec=JSON.parse(fs.readFileSync(targetFile,"utf8"));
const cfg=JSON.parse(fs.readFileSync(spec.configPath,"utf8"));
const orders=new Map((cfg.orders||[]).map(x=>[x.id,x]));
const builds=new Map((cfg.buildNodes||[]).map(x=>[x.id,x]));
const startCoin=Number(spec.assumptions?.startCoin||0);

let cumulative=startCoin,totalSource=0,totalSink=0,minCumulative=cumulative;
const days=[],failures=[];
for(const d of (cfg.days||[]).slice().sort((a,b)=>a.day-b.day)){
  const dayOrders=(d.orderIds||[]).map(id=>orders.get(id)).filter(Boolean);
  const dayBuilds=(d.buildNodeIds||[]).map(id=>builds.get(id)).filter(Boolean);

  const orderCoin=dayOrders.reduce((sum,o)=>sum+(o.rewards||[]).filter(r=>r.type==="COIN").reduce((a,r)=>a+Number(r.amount||0),0),0);
  const dayCoin=(d.rewards||[]).filter(r=>r.type==="COIN").reduce((a,r)=>a+Number(r.amount||0),0);
  const buildCoinReward=dayBuilds.reduce((sum,b)=>sum+(b.rewards||[]).filter(r=>r.type==="COIN").reduce((a,r)=>a+Number(r.amount||0),0),0);
  const source=orderCoin+dayCoin+buildCoinReward;
  const sink=dayBuilds.reduce((a,b)=>a+Number(b.coinCost||0),0);

  const before=cumulative;
  cumulative+=source;
  const affordable=cumulative>=sink;
  const beforeSink=cumulative;
  cumulative-=sink;
  minCumulative=Math.min(minCumulative,cumulative);
  totalSource+=source; totalSink+=sink;

  days.push({
    day:d.day,
    orderCount:dayOrders.length,
    buildCount:dayBuilds.length,
    sourceCoin:source,
    sinkCoin:sink,
    balanceBeforeDay:before,
    balanceBeforeBuild:beforeSink,
    balanceAfterDay:cumulative,
    buildAffordable:affordable,
    buildToSourceRatio:source>0?Number((sink/source).toFixed(4)):(sink>0?null:0)
  });
  if(!affordable)failures.push(`Day ${d.day}: build sink ${sink} not affordable from ${beforeSink}`);
}

const ratio=totalSink>0?totalSource/totalSink:Infinity;
const maxBuildRatio=Math.max(...days.map(x=>x.buildToSourceRatio??Infinity));
const g=spec.gates||{};
if(minCumulative<Number(g.minCumulativeCoin??0))failures.push(`min cumulative coin ${minCumulative} < ${g.minCumulativeCoin}`);
if(cumulative<Number(g.endingCoinMin??-Infinity))failures.push(`ending coin ${cumulative} < ${g.endingCoinMin}`);
if(cumulative>Number(g.endingCoinMax??Infinity))failures.push(`ending coin ${cumulative} > ${g.endingCoinMax}`);
if(ratio<Number(g.sourceSinkRatioMin??-Infinity))failures.push(`source/sink ratio ${ratio.toFixed(4)} < ${g.sourceSinkRatioMin}`);
if(ratio>Number(g.sourceSinkRatioMax??Infinity))failures.push(`source/sink ratio ${ratio.toFixed(4)} > ${g.sourceSinkRatioMax}`);
if(maxBuildRatio>Number(g.maxDailyBuildToSourceRatio??Infinity))failures.push(`max daily build/source ratio ${maxBuildRatio.toFixed(4)} > ${g.maxDailyBuildToSourceRatio}`);

console.log(JSON.stringify({
  targetFile,
  assumptions:spec.assumptions,
  summary:{
    startCoin,totalSource,totalSink,
    sourceSinkRatio:Number(ratio.toFixed(4)),
    endingCoin:cumulative,
    minCumulativeCoin:minCumulative,
    maxDailyBuildToSourceRatio:Number(maxBuildRatio.toFixed(4))
  },
  days,failures,
  result:failures.length?"FAIL":"PASS"
},null,2));
process.exit(failures.length?1:0);
