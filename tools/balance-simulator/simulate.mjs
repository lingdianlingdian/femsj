#!/usr/bin/env node
import fs from "node:fs";

const file=process.argv[2], dayArg=process.argv[3];
if(!file){
  console.error("Usage: node tools/balance-simulator/simulate.mjs <game_content.json> [day]");
  process.exit(2);
}
const cfg=JSON.parse(fs.readFileSync(file,"utf8"));
const items=new Map((cfg.items||[]).map(x=>[x.id,x]));
const producers=cfg.producers||[];
const transforms=cfg.transformations||[];
const recipes=cfg.recipes||[];
const orders=cfg.orders||[];
const days=cfg.days||[];

const producing=new Map();
for(const p of producers){
  const total=(p.outputPool||[]).reduce((a,x)=>a+x.weight,0);
  for(const x of p.outputPool||[]){
    if(!producing.has(x.itemId))producing.set(x.itemId,[]);
    producing.get(x.itemId).push({producer:p,prob:x.weight/total});
  }
}
const toItem=new Map();
for(const t of transforms){
  for(const o of t.outputs||[]){
    if(o.type==="ITEM" && o.id){
      if(!toItem.has(o.id))toItem.set(o.id,[]);
      toItem.get(o.id).push({kind:"transform",row:t});
    }
  }
}
for(const r of recipes){
  if(!toItem.has(r.outputItemId))toItem.set(r.outputItemId,[]);
  toItem.get(r.outputItemId).push({kind:"recipe",row:r});
}

const memo=new Map(), stack=new Set();
function estimate(itemId){
  if(memo.has(itemId)) return memo.get(itemId);
  if(stack.has(itemId)) return {energy:Infinity,wait:Infinity,path:["CYCLE"]};
  stack.add(itemId);
  const candidates=[];
  for(const p of producing.get(itemId)||[]){
    candidates.push({
      energy:p.producer.energyCost/p.prob,
      wait:(p.producer.cooldownSec||0)/Math.max(1,p.producer.capacity||1),
      path:[`PRODUCER:${p.producer.id}@p=${p.prob.toFixed(4)}`]
    });
  }
  for(const e of toItem.get(itemId)||[]){
    if(e.kind==="transform"){
      let energy=0,wait=e.row.durationSec||0,path=[`TRANSFORM:${e.row.id}`],bad=false;
      for(const x of e.row.inputs||[]){
        const z=estimate(x.itemId); if(!Number.isFinite(z.energy)){bad=true;break;}
        energy+=z.energy*x.count; wait+=z.wait*x.count; path.push(...z.path);
      }
      if(!bad)candidates.push({energy,wait,path});
    }else{
      let energy=0,wait=e.row.durationSec||0,path=[`RECIPE:${e.row.id}`],bad=false;
      for(const x of e.row.inputs||[]){
        const z=estimate(x.itemId); if(!Number.isFinite(z.energy)){bad=true;break;}
        energy+=z.energy*x.count; wait+=z.wait*x.count; path.push(...z.path);
      }
      if(!bad)candidates.push({energy,wait,path});
    }
  }
  stack.delete(itemId);
  const best=candidates.sort((a,b)=>a.energy-b.energy || a.wait-b.wait)[0]||{energy:Infinity,wait:Infinity,path:["UNREACHABLE"]};
  memo.set(itemId,best);return best;
}

function orderEstimate(o){
  let energy=0,wait=0,paths=[],unreachable=[];
  for(const x of o.requirements||[]){
    const e=estimate(x.itemId);
    if(!Number.isFinite(e.energy)){unreachable.push(x.itemId);continue;}
    energy+=e.energy*x.count; wait+=e.wait*x.count; paths.push({itemId:x.itemId,count:x.count,...e});
  }
  return {orderId:o.id,energyExpected:energy,waitSecExpected:wait,unreachable,paths};
}
const targetDays=dayArg?[days.find(x=>x.day===Number(dayArg))].filter(Boolean):days;
const result=[];
for(const d of targetDays){
  const rows=(d.orderIds||[]).map(id=>orders.find(x=>x.id===id)).filter(Boolean).map(orderEstimate);
  result.push({
    day:d.day,
    orders:rows,
    dayEnergyExpected:rows.reduce((a,x)=>a+x.energyExpected,0),
    dayWaitSecExpected:rows.reduce((a,x)=>a+x.waitSecExpected,0),
    unreachable:[...new Set(rows.flatMap(x=>x.unreachable))]
  });
}
console.log(JSON.stringify({file,days:result},null,2));
