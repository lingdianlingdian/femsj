#!/usr/bin/env node
import fs from "node:fs";

const file=process.argv[2];
const dayArg=process.argv[3] ? Number(process.argv[3]) : null;
const runs=process.argv[4] ? Number(process.argv[4]) : 10000;
const seedArg=process.argv[5] ? Number(process.argv[5]) : 20260925;

if(!file){
  console.error("Usage: node tools/balance-simulator/simulate.mjs <game_content.json> [day] [runs=10000] [seed=20260925]");
  process.exit(2);
}
if(!(runs>=100 && runs<=100000)){
  console.error("runs must be between 100 and 100000");
  process.exit(2);
}

const cfg=JSON.parse(fs.readFileSync(file,"utf8"));
const items=new Map((cfg.items||[]).map(x=>[x.id,x]));
const producers=cfg.producers||[];
const transforms=cfg.transformations||[];
const recipes=cfg.recipes||[];
const orders=cfg.orders||[];
const days=cfg.days||[];

function mulberry32(seed){
  return function(){
    let t=seed+=0x6D2B79F5;
    t=Math.imul(t^t>>>15,t|1);
    t^=t+Math.imul(t^t>>>7,t|61);
    return ((t^t>>>14)>>>0)/4294967296;
  };
}
const rng=mulberry32(seedArg);

function quantile(sorted,q){
  if(!sorted.length)return null;
  const pos=(sorted.length-1)*q;
  const lo=Math.floor(pos),hi=Math.ceil(pos);
  if(lo===hi)return sorted[lo];
  return sorted[lo]+(sorted[hi]-sorted[lo])*(pos-lo);
}
function stats(values){
  const xs=values.filter(Number.isFinite).sort((a,b)=>a-b);
  if(!xs.length)return null;
  const mean=xs.reduce((a,b)=>a+b,0)/xs.length;
  return {
    n:xs.length,
    mean:Number(mean.toFixed(2)),
    p50:Number(quantile(xs,.50).toFixed(2)),
    p75:Number(quantile(xs,.75).toFixed(2)),
    p90:Number(quantile(xs,.90).toFixed(2)),
    p95:Number(quantile(xs,.95).toFixed(2)),
    max:Number(xs[xs.length-1].toFixed(2))
  };
}

const producersByOutput=new Map();
for(const p of producers){
  const pool=p.outputPool||[];
  const total=pool.reduce((a,x)=>a+Number(x.weight||0),0);
  if(!(total>0))continue;
  for(const x of pool){
    if(!producersByOutput.has(x.itemId))producersByOutput.set(x.itemId,[]);
    producersByOutput.get(x.itemId).push({producer:p,prob:Number(x.weight)/total});
  }
}

const transformByOutput=new Map();
for(const t of transforms){
  for(const o of t.outputs||[]){
    if(o.type==="ITEM" && o.id){
      if(!transformByOutput.has(o.id))transformByOutput.set(o.id,[]);
      transformByOutput.get(o.id).push({kind:"TRANSFORM",row:t});
    }
  }
}
for(const r of recipes){
  if(r.outputItemId){
    if(!transformByOutput.has(r.outputItemId))transformByOutput.set(r.outputItemId,[]);
    transformByOutput.get(r.outputItemId).push({kind:"RECIPE",row:r});
  }
}

const unresolvedGlobal=new Set();

function sampleProducer(itemId,count=1){
  const candidates=(producersByOutput.get(itemId)||[]).filter(x=>
    Number.isFinite(Number(x.producer.energyCost)) &&
    Number.isFinite(Number(x.producer.capacity)) &&
    Number.isFinite(Number(x.producer.cooldownSec)) &&
    x.producer.capacity>0 && x.prob>0
  );
  if(!candidates.length)return null;

  // Select lowest expected energy producer. Random output is sampled below.
  candidates.sort((a,b)=>(a.producer.energyCost/a.prob)-(b.producer.energyCost/b.prob));
  const {producer,prob}=candidates[0];

  let successes=0,taps=0;
  while(successes<count){
    taps++;
    if(rng()<prob)successes++;
    if(taps>1000000)throw new Error("simulation runaway");
  }
  const energy=taps*Number(producer.energyCost);
  const capacity=Number(producer.capacity);
  const cooldowns=Math.max(0,Math.floor((taps-1)/capacity));
  const wait=cooldowns*Number(producer.cooldownSec);
  return {
    energy,wait,
    peakCells:Math.min(63,Math.max(count,Math.ceil(taps*prob))),
    manualActions:taps,
    path:[`PRODUCER:${producer.id}`],
    producerTaps:{[producer.id]:taps}
  };
}

function mergeMetrics(parts,extraWait=0,pathPrefix=[]){
  const out={energy:0,wait:extraWait,peakCells:0,manualActions:0,path:[...pathPrefix],producerTaps:{}};
  for(const p of parts){
    out.energy+=p.energy;
    out.wait+=p.wait;
    out.peakCells=Math.max(out.peakCells,p.peakCells);
    out.manualActions+=p.manualActions;
    out.path.push(...p.path);
    for(const [k,v] of Object.entries(p.producerTaps||{}))out.producerTaps[k]=(out.producerTaps[k]||0)+v;
  }
  return out;
}

function sampleItem(itemId,count=1,stack=[]){
  if(stack.includes(itemId)){
    unresolvedGlobal.add(`CYCLE:${[...stack,itemId].join("->")}`);
    return null;
  }

  const direct=sampleProducer(itemId,count);
  const routes=transformByOutput.get(itemId)||[];

  // If a direct producer exists, use it. Otherwise evaluate first fully-resolvable transformation.
  if(direct)return direct;

  for(const route of routes){
    const r=route.row;
    const parts=[];
    let ok=true;
    if(route.kind==="TRANSFORM"){
      for(const input of r.inputs||[]){
        const p=sampleItem(input.itemId,(input.count||1)*count,[...stack,itemId]);
        if(!p){ok=false;break;}
        parts.push(p);
      }
      if(ok){
        const wait=(Number(r.durationSec)||0)*count;
        const m=mergeMetrics(parts,wait,[`TRANSFORM:${r.id}`]);
        m.manualActions+=count; // merge/cook action
        m.peakCells=Math.min(63,Math.max(m.peakCells,(r.inputs||[]).reduce((a,x)=>a+(x.count||1),0)));
        return m;
      }
    }else{
      for(const input of r.inputs||[]){
        const p=sampleItem(input.itemId,(input.count||1)*count,[...stack,itemId]);
        if(!p){ok=false;break;}
        parts.push(p);
      }
      if(ok){
        const wait=(Number(r.durationSec)||0)*count;
        const m=mergeMetrics(parts,wait,[`RECIPE:${r.id}`]);
        m.manualActions+=count;
        m.peakCells=Math.min(63,Math.max(m.peakCells,(r.inputs||[]).reduce((a,x)=>a+(x.count||1),0)));
        return m;
      }
    }
  }

  unresolvedGlobal.add(itemId);
  return null;
}

function sampleOrder(o){
  const parts=[];
  const unresolved=[];
  for(const x of o.requirements||[]){
    const p=sampleItem(x.itemId,x.count||1,[]);
    if(!p){unresolved.push(x.itemId);continue;}
    parts.push(p);
  }
  if(unresolved.length)return {ok:false,unresolved};
  const m=mergeMetrics(parts,0,[`ORDER:${o.id}`]);
  m.manualActions+=1; // submit
  return {ok:true,...m};
}

const targetDays=dayArg ? days.filter(d=>d.day===dayArg) : days;
if(dayArg && !targetDays.length){
  console.error(`Day ${dayArg} not found`);
  process.exit(2);
}

const result=[];
for(const d of targetDays){
  const dayOrders=(d.orderIds||[]).map(id=>orders.find(o=>o.id===id)).filter(Boolean);
  const samples=[];
  let unresolvedRuns=0;
  const unresolvedItems=new Set();

  for(let i=0;i<runs;i++){
    let energy=0,wait=0,peakCells=0,manualActions=0,ok=true;
    for(const o of dayOrders){
      const s=sampleOrder(o);
      if(!s.ok){
        ok=false;
        for(const x of s.unresolved)unresolvedItems.add(x);
        break;
      }
      energy+=s.energy;
      wait+=s.wait;
      peakCells=Math.max(peakCells,s.peakCells);
      manualActions+=s.manualActions;
    }
    if(ok)samples.push({energy,wait,peakCells,manualActions});
    else unresolvedRuns++;
  }

  result.push({
    day:d.day,
    orderCount:dayOrders.length,
    runsRequested:runs,
    runsResolved:samples.length,
    unresolvedRuns,
    unresolvedItems:[...unresolvedItems],
    energy:stats(samples.map(x=>x.energy)),
    waitSec:stats(samples.map(x=>x.wait)),
    peakCells:stats(samples.map(x=>x.peakCells)),
    manualActions:stats(samples.map(x=>x.manualActions)),
    caveats:[
      "No cross-order byproduct reuse yet.",
      "PeakCells is a dependency-pressure proxy, not a full board-state simulation.",
      "Unknown producer weights/capacity/cooldown or recipe duration make dependent items unresolved."
    ]
  });
}

console.log(JSON.stringify({
  simulatorVersion:"2.0-monte-carlo",
  file,seed:seedArg,
  unresolvedGlobal:[...unresolvedGlobal],
  days:result
},null,2));
