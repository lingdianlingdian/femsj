#!/usr/bin/env node
import fs from "node:fs";

const file=process.argv[2];
const dayArg=process.argv[3] ? Number(process.argv[3]) : null;
const runs=process.argv[4] ? Number(process.argv[4]) : 2000;
const seedArg=process.argv[5] ? Number(process.argv[5]) : 20260925;
const strategyName=(process.argv[6]||"OPTIMIZED").toUpperCase();

if(!file){
  console.error("Usage: node tools/balance-simulator-v3/simulate.mjs <game_content.json> [day] [runs=2000] [seed=20260925] [CASUAL|OPTIMIZED|WHALE]");
  process.exit(2);
}
if(!(runs>=100 && runs<=100000)){
  console.error("runs must be between 100 and 100000");
  process.exit(2);
}

const profiles={
  CASUAL:{
    boardCells:63,storageSlots:8,pressureThreshold:.95,
    proactiveStorage:false,autoCompact:false,
    cooldownWaitMultiplier:1,recipeWaitMultiplier:1,
    longWaitSessionSec:600
  },
  OPTIMIZED:{
    boardCells:63,storageSlots:8,pressureThreshold:.82,
    proactiveStorage:true,autoCompact:true,
    cooldownWaitMultiplier:1,recipeWaitMultiplier:1,
    longWaitSessionSec:600
  },
  WHALE:{
    boardCells:63,storageSlots:16,pressureThreshold:.88,
    proactiveStorage:true,autoCompact:true,
    cooldownWaitMultiplier:.5,recipeWaitMultiplier:.5,
    longWaitSessionSec:600
  }
};
const profile=profiles[strategyName];
if(!profile){
  console.error("strategy must be CASUAL, OPTIMIZED or WHALE");
  process.exit(2);
}

const cfg=JSON.parse(fs.readFileSync(file,"utf8"));
const producers=cfg.producers||[];
const transforms=cfg.transformations||[];
const recipes=cfg.recipes||[];
const orders=cfg.orders||[];
const days=cfg.days||[];
const ordersById=new Map(orders.map(x=>[x.id,x]));

function mulberry32(seed){
  return function(){
    let t=seed+=0x6D2B79F5;
    t=Math.imul(t^t>>>15,t|1);
    t^=t+Math.imul(t^t>>>7,t|61);
    return ((t^t>>>14)>>>0)/4294967296;
  };
}
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
const sumMap=m=>[...m.values()].reduce((a,b)=>a+b,0);
const inc=(m,k,n=1)=>m.set(k,(m.get(k)||0)+n);
function dec(m,k,n=1){
  const v=m.get(k)||0;
  if(v<n)return false;
  if(v===n)m.delete(k);else m.set(k,v-n);
  return true;
}

const producerCandidates=new Map();
for(const p of producers){
  const pool=p.outputPool||[];
  const total=pool.reduce((a,x)=>a+Number(x.weight||0),0);
  if(!(total>0))continue;
  for(const x of pool){
    if(!producerCandidates.has(x.itemId))producerCandidates.set(x.itemId,[]);
    producerCandidates.get(x.itemId).push({
      producer:p,
      probability:Number(x.weight)/total
    });
  }
}

const routesByOutput=new Map();
for(const t of transforms){
  for(const o of t.outputs||[]){
    if(o.type==="ITEM"&&o.id){
      if(!routesByOutput.has(o.id))routesByOutput.set(o.id,[]);
      routesByOutput.get(o.id).push({kind:"TRANSFORM",row:t});
    }
  }
}
for(const r of recipes){
  if(r.outputItemId){
    if(!routesByOutput.has(r.outputItemId))routesByOutput.set(r.outputItemId,[]);
    routesByOutput.get(r.outputItemId).push({kind:"RECIPE",row:r});
  }
}

const mergeRules=[];
for(const t of transforms){
  const itemOut=(t.outputs||[]).find(x=>x.type==="ITEM"&&x.id);
  if(t.type==="MERGE2"&&itemOut&&(t.inputs||[]).length===1&&(t.inputs[0].count||1)>=2){
    mergeRules.push({
      id:t.id,inputId:t.inputs[0].itemId,inputCount:t.inputs[0].count||2,
      outputId:itemOut.id,outputCount:itemOut.amount||1
    });
  }
}

function staticResolvable(itemId,stack=[]){
  if(stack.includes(itemId))return false;
  const direct=(producerCandidates.get(itemId)||[]).some(x=>{
    const p=x.producer;
    return Number(p.energyCost)>=0&&Number(p.capacity)>0&&Number(p.cooldownSec)>=0&&x.probability>0;
  });
  if(direct)return true;
  for(const route of routesByOutput.get(itemId)||[]){
    const inputs=route.row.inputs||[];
    if(inputs.length&&inputs.every(x=>staticResolvable(x.itemId,[...stack,itemId])))return true;
  }
  return false;
}

function sampleWeighted(pool,rng){
  const total=pool.reduce((a,x)=>a+Number(x.weight||0),0);
  if(!(total>0))return null;
  let roll=rng()*total;
  for(const x of pool){
    roll-=Number(x.weight||0);
    if(roll<=0)return x.itemId;
  }
  return pool[pool.length-1]?.itemId||null;
}

function runOneDay(dayRow,runSeed){
  const rng=mulberry32(runSeed);
  const dayOrders=(dayRow.orderIds||[]).map(id=>ordersById.get(id)).filter(Boolean);
  const remainingDemand=new Map();
  for(const o of dayOrders)for(const x of o.requirements||[])inc(remainingDemand,x.itemId,x.count||1);

  const state={
    board:new Map(),storage:new Map(),producerState:new Map(),byproductCredit:new Map(),
    energy:0,waitSec:0,manualActions:0,peakBoard:0,peakStorage:0,
    boardFullHit:false,hardBlocked:false,hardBlockReason:null,
    byproductProduced:0,byproductReused:0,storageMoves:0,mergeCompactions:0,
    sessionBreaks:0,producerCooldowns:0,cookOps:0
  };

  const inventoryCount=id=>(state.board.get(id)||0)+(state.storage.get(id)||0);
  const boardCount=()=>sumMap(state.board);
  const storageCount=()=>sumMap(state.storage);
  const updatePeaks=()=>{
    state.peakBoard=Math.max(state.peakBoard,boardCount());
    state.peakStorage=Math.max(state.peakStorage,storageCount());
    if(boardCount()>=profile.boardCells)state.boardFullHit=true;
  };

  function consumeOne(id){
    if(dec(state.board,id,1)){
      if((state.byproductCredit.get(id)||0)>0){
        dec(state.byproductCredit,id,1); state.byproductReused++;
      }
      return true;
    }
    if(dec(state.storage,id,1)){
      state.manualActions++;
      if((state.byproductCredit.get(id)||0)>0){
        dec(state.byproductCredit,id,1); state.byproductReused++;
      }
      return true;
    }
    return false;
  }
  function consume(id,count){
    for(let i=0;i<count;i++)if(!consumeOne(id))return false;
    return true;
  }

  function compactBoard(protectedIds=new Set()){
    if(!profile.autoCompact)return false;
    let changed=false,progress=true,guard=0;
    while(progress&&guard++<200){
      progress=false;
      for(const rule of mergeRules){
        const have=state.board.get(rule.inputId)||0;
        if(have<rule.inputCount)continue;
        if(protectedIds.has(rule.inputId))continue;
        const inputDemand=remainingDemand.get(rule.inputId)||0;
        const outputDemand=remainingDemand.get(rule.outputId)||0;
        const pressure=boardCount()/profile.boardCells;
        if(!(outputDemand>0||inputDemand<rule.inputCount||pressure>=.96))continue;
        dec(state.board,rule.inputId,rule.inputCount);
        inc(state.board,rule.outputId,rule.outputCount);
        state.manualActions++;
        state.mergeCompactions++;
        progress=true; changed=true;
        updatePeaks();
        if(boardCount()<profile.boardCells*profile.pressureThreshold)break;
      }
    }
    return changed;
  }

  function storageCandidate(protectedIds){
    const candidates=[];
    for(const [id,count] of state.board){
      if(count<=0||protectedIds.has(id))continue;
      const demand=remainingDemand.get(id)||0;
      const byproduct=state.byproductCredit.get(id)||0;
      candidates.push({id,demand,byproduct});
    }
    candidates.sort((a,b)=>
      (a.demand-b.demand)||
      (b.byproduct-a.byproduct)||
      a.id.localeCompare(b.id)
    );
    return candidates[0]?.id||null;
  }

  function relievePressure(protectedIds=new Set()){
    compactBoard(protectedIds);
    while(boardCount()>=profile.boardCells*profile.pressureThreshold&&storageCount()<profile.storageSlots){
      const id=storageCandidate(protectedIds);
      if(!id)break;
      dec(state.board,id,1); inc(state.storage,id,1);
      state.storageMoves++; state.manualActions++;
      updatePeaks();
      if(!profile.proactiveStorage)break;
    }
    return boardCount()<profile.boardCells;
  }

  function addBoard(id,protectedIds=new Set()){
    if(profile.proactiveStorage&&boardCount()>=profile.boardCells*profile.pressureThreshold){
      relievePressure(protectedIds);
    }
    if(boardCount()>=profile.boardCells){
      state.boardFullHit=true;
      relievePressure(protectedIds);
    }
    if(boardCount()>=profile.boardCells){
      state.hardBlocked=true;
      state.hardBlockReason=`BOARD_FULL:${id}`;
      return false;
    }
    inc(state.board,id,1);
    updatePeaks();
    return true;
  }

  function chooseProducer(itemId){
    const candidates=(producerCandidates.get(itemId)||[]).filter(x=>{
      const p=x.producer;
      return Number.isFinite(Number(p.energyCost))&&Number(p.energyCost)>=0&&
        Number.isFinite(Number(p.capacity))&&Number(p.capacity)>0&&
        Number.isFinite(Number(p.cooldownSec))&&Number(p.cooldownSec)>=0&&
        x.probability>0;
    });
    candidates.sort((a,b)=>{
      const ea=Number(a.producer.energyCost)/a.probability;
      const eb=Number(b.producer.energyCost)/b.probability;
      return ea-eb;
    });
    return candidates[0]?.producer||null;
  }

  function tapProducer(producer,targetId){
    let ps=state.producerState.get(producer.id);
    if(!ps){
      ps={remaining:Number(producer.capacity)};
      state.producerState.set(producer.id,ps);
    }
    if(ps.remaining<=0){
      const wait=Math.round(Number(producer.cooldownSec)*profile.cooldownWaitMultiplier);
      state.waitSec+=wait;
      state.producerCooldowns++;
      if(wait>=profile.longWaitSessionSec)state.sessionBreaks++;
      ps.remaining=Number(producer.capacity);
    }
    const outId=sampleWeighted(producer.outputPool||[],rng);
    if(!outId)return false;
    state.energy+=Number(producer.energyCost)||0;
    state.manualActions++;
    ps.remaining--;
    if(outId!==targetId){
      inc(state.byproductCredit,outId,1);
      state.byproductProduced++;
    }
    return addBoard(outId,new Set([targetId]));
  }

  function craftRoute(itemId,route,stack){
    const row=route.row;
    const inputs=row.inputs||[];
    for(const input of inputs){
      const n=input.count||1;
      if(!ensure(input.itemId,n,[...stack,itemId]))return false;
    }
    for(const input of inputs){
      if(!consume(input.itemId,input.count||1))return false;
    }
    const duration=route.kind==="RECIPE" ? Number(row.durationSec)||0 : Number(row.durationSec)||0;
    const wait=Math.round(duration*profile.recipeWaitMultiplier);
    state.waitSec+=wait;
    state.manualActions++;
    state.cookOps++;
    if(wait>=profile.longWaitSessionSec)state.sessionBreaks++;
    return addBoard(itemId,new Set([itemId]));
  }

  function ensure(itemId,count=1,stack=[]){
    if(stack.includes(itemId))return false;
    let guard=0;
    while(inventoryCount(itemId)<count){
      if(state.hardBlocked)return false;
      if(++guard>200000)return false;

      const producer=chooseProducer(itemId);
      if(producer){
        if(!tapProducer(producer,itemId))return false;
        continue;
      }

      const route=(routesByOutput.get(itemId)||[]).find(r=>
        (r.row.inputs||[]).length>0&&
        (r.row.inputs||[]).every(x=>staticResolvable(x.itemId,[...stack,itemId]))
      );
      if(!route)return false;
      if(!craftRoute(itemId,route,stack))return false;
    }
    return true;
  }

  for(const o of dayOrders){
    for(const x of o.requirements||[]){
      if(!ensure(x.itemId,x.count||1,[])){
        state.hardBlocked=true;
        state.hardBlockReason=state.hardBlockReason||`UNRESOLVED:${x.itemId}`;
        break;
      }
    }
    if(state.hardBlocked)break;
    for(const x of o.requirements||[]){
      if(!consume(x.itemId,x.count||1)){
        state.hardBlocked=true;
        state.hardBlockReason=`CONSUME_MISSING:${x.itemId}`;
        break;
      }
      const left=Math.max(0,(remainingDemand.get(x.itemId)||0)-(x.count||1));
      if(left)remainingDemand.set(x.itemId,left);else remainingDemand.delete(x.itemId);
    }
    if(state.hardBlocked)break;
    state.manualActions++;
    if(profile.proactiveStorage)relievePressure(new Set());
  }

  const residualBoard=boardCount(), residualStorage=storageCount();
  return {
    ok:!state.hardBlocked,
    hardBlockReason:state.hardBlockReason,
    energy:state.energy,
    waitSec:state.waitSec,
    peakBoardCells:state.peakBoard,
    peakStorageCells:state.peakStorage,
    manualActions:state.manualActions,
    sessionCount:1+state.sessionBreaks,
    boardFullHit:state.boardFullHit,
    byproductProduced:state.byproductProduced,
    byproductReused:state.byproductReused,
    byproductUtilization:state.byproductProduced?state.byproductReused/state.byproductProduced:1,
    storageMoves:state.storageMoves,
    mergeCompactions:state.mergeCompactions,
    residualBoard,
    residualStorage,
    producerCooldowns:state.producerCooldowns,
    cookOps:state.cookOps
  };
}

const targetDays=dayArg?days.filter(d=>d.day===dayArg):days;
if(dayArg&&!targetDays.length){
  console.error(`Day ${dayArg} not found`);
  process.exit(2);
}

const results=[];
for(const d of targetDays){
  const samples=[],blockedReasons=new Map();
  let boardFullRuns=0,hardBlockedRuns=0;
  for(let i=0;i<runs;i++){
    const s=runOneDay(d,seedArg+i*7919+d.day*104729);
    if(s.boardFullHit)boardFullRuns++;
    if(!s.ok){
      hardBlockedRuns++;
      inc(blockedReasons,s.hardBlockReason||"UNKNOWN",1);
    }else samples.push(s);
  }
  results.push({
    day:d.day,
    orderCount:(d.orderIds||[]).length,
    runsRequested:runs,
    runsResolved:samples.length,
    hardBlockedRuns,
    pFullBoard:Number((boardFullRuns/runs).toFixed(4)),
    pHardBlocked:Number((hardBlockedRuns/runs).toFixed(4)),
    blockedReasons:Object.fromEntries([...blockedReasons].sort((a,b)=>b[1]-a[1])),
    energy:stats(samples.map(x=>x.energy)),
    waitSec:stats(samples.map(x=>x.waitSec)),
    peakBoardCells:stats(samples.map(x=>x.peakBoardCells)),
    peakStorageCells:stats(samples.map(x=>x.peakStorageCells)),
    manualActions:stats(samples.map(x=>x.manualActions)),
    sessionCount:stats(samples.map(x=>x.sessionCount)),
    byproductUtilization:stats(samples.map(x=>x.byproductUtilization)),
    storageMoves:stats(samples.map(x=>x.storageMoves)),
    mergeCompactions:stats(samples.map(x=>x.mergeCompactions)),
    residualBoard:stats(samples.map(x=>x.residualBoard)),
    residualStorage:stats(samples.map(x=>x.residualStorage))
  });
}

console.log(JSON.stringify({
  simulatorVersion:"3.0-board-state",
  file,
  seed:seedArg,
  strategy:strategyName,
  profile,
  caveats:[
    "Board uses one cell per item instance; no stackable item exception is assumed.",
    "Producer cooldown and recipe duration are accumulated sequentially; parallel cookware scheduling is not yet modeled.",
    "Storage moves are heuristic and do not model UI travel time.",
    "WHALE is a DEV strategy template with extra storage and 0.5 wait multipliers; it is not a claim about competitor monetization.",
    "Only runtime config values supplied to this simulator are treated as executable inputs."
  ],
  days:results
},null,2));
