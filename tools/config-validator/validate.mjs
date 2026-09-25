#!/usr/bin/env node
import fs from "node:fs";

const file=process.argv[2];
if(!file){
  console.error("Usage: node tools/config-validator/validate.mjs <game_content.json>");
  process.exit(2);
}
const cfg=JSON.parse(fs.readFileSync(file,"utf8"));
const errors=[], warnings=[];
const arr=(k)=>Array.isArray(cfg[k])?cfg[k]:[];
const byId={};
for(const key of ["items","transformations","producers","cookwares","recipes","orders","days","buildNodes","events"]){
  byId[key]=new Map();
  for(const row of arr(key)){
    if(!row?.id){errors.push(`${key}: row without id`);continue;}
    if(byId[key].has(row.id)) errors.push(`${key}: duplicate id ${row.id}`);
    byId[key].set(row.id,row);
  }
}
const hasItem=id=>byId.items.has(id);
const requireRef=(ok,msg)=>{if(!ok)errors.push(msg)};

for(const t of arr("transformations")){
  for(const x of t.inputs||[]) requireRef(hasItem(x.itemId),`transformation ${t.id}: missing input item ${x.itemId}`);
  for(const x of t.outputs||[]){
    if(x.type==="ITEM") requireRef(hasItem(x.id),`transformation ${t.id}: missing output item ${x.id}`);
  }
  if(t.toolId && !byId.cookwares.has(t.toolId)) errors.push(`transformation ${t.id}: missing cookware ${t.toolId}`);
}
for(const p of arr("producers")){
  let sum=0;
  for(const x of p.outputPool||[]){
    requireRef(hasItem(x.itemId),`producer ${p.id}: missing output item ${x.itemId}`);
    if(!(x.weight>0)) errors.push(`producer ${p.id}: non-positive weight for ${x.itemId}`);
    sum+=Number(x.weight||0);
  }
  if(sum<=0) errors.push(`producer ${p.id}: empty/invalid output pool`);
  if(p.capacity<=0) errors.push(`producer ${p.id}: capacity must be >0`);
  if(p.cooldownSec<0) errors.push(`producer ${p.id}: cooldownSec must be >=0`);
}
for(const r of arr("recipes")){
  requireRef(byId.cookwares.has(r.cookwareId),`recipe ${r.id}: missing cookware ${r.cookwareId}`);
  for(const x of r.inputs||[]) requireRef(hasItem(x.itemId),`recipe ${r.id}: missing input item ${x.itemId}`);
  requireRef(hasItem(r.outputItemId),`recipe ${r.id}: missing output item ${r.outputItemId}`);
}
for(const o of arr("orders")){
  for(const x of o.requirements||[]) requireRef(hasItem(x.itemId),`order ${o.id}: missing item ${x.itemId}`);
  for(const id of o.producerIds||[]) requireRef(byId.producers.has(id),`order ${o.id}: missing producer ${id}`);
  for(const id of o.recipeIds||[]) requireRef(byId.recipes.has(id),`order ${o.id}: missing recipe ${id}`);
  for(const id of o.cookwareIds||[]) requireRef(byId.cookwares.has(id),`order ${o.id}: missing cookware ${id}`);
  const d=o.difficulty||{};
  if(d.energyP90<d.energyP50) errors.push(`order ${o.id}: P90 < P50`);
  const highEnergy=d.energyP90>=300, highWait=d.cookWaitSec>=1200, highBlock=d.producerBlockSec>=1200;
  if(highEnergy && highWait && highBlock) errors.push(`order ${o.id}: triple-wall gate failed (energy+cook+producer)`);
  if(d.byproductUtilization!=null && d.byproductUtilization<0.4) warnings.push(`order ${o.id}: low byproduct utilization ${d.byproductUtilization}`);
}
for(const d of arr("days")){
  for(const id of d.orderIds||[]){
    const o=byId.orders.get(id);
    requireRef(!!o,`day ${d.id}: missing order ${id}`);
    if(o && o.day!==d.day) errors.push(`day ${d.id}: order ${id} belongs to day ${o.day}`);
  }
  for(const id of d.buildNodeIds||[]) requireRef(byId.buildNodes.has(id),`day ${d.id}: missing build node ${id}`);
}
const buildGraph=new Map(arr("buildNodes").map(x=>[x.id,x.prerequisites||[]]));
const visiting=new Set(), done=new Set();
function dfs(id){
  if(done.has(id))return;
  if(visiting.has(id)){errors.push(`build cycle detected at ${id}`);return;}
  visiting.add(id);
  for(const dep of buildGraph.get(id)||[]){
    if(!buildGraph.has(dep)) errors.push(`build ${id}: missing prerequisite ${dep}`);
    else dfs(dep);
  }
  visiting.delete(id); done.add(id);
}
for(const id of buildGraph.keys()) dfs(id);

for(const e of arr("events")){
  if(!e.settlement) errors.push(`event ${e.id}: settlement missing`);
  if(!(e.progressSources||[]).length) errors.push(`event ${e.id}: progressSources empty`);

  const durationKeys=["durationMinutes","durationHours","durationDays"].filter(k=>e[k]!=null);
  if(durationKeys.length>1) errors.push(`event ${e.id}: multiple duration units configured (${durationKeys.join(",")})`);
  for(const k of durationKeys){
    if(!(Number(e[k])>0)) errors.push(`event ${e.id}: ${k} must be >0`);
  }

  let prev=-Infinity;
  for(const m of e.milestones||[]){
    if(!(m.threshold>0)) errors.push(`event ${e.id}: milestone threshold must be >0`);
    if(m.threshold<=prev) errors.push(`event ${e.id}: milestone thresholds must be strictly ascending`);
    prev=m.threshold;
    if(!Array.isArray(m.rewards) || !m.rewards.length) errors.push(`event ${e.id}: milestone ${m.threshold} has no rewards`);
    for(const r of m.rewards||[]){
      if(!(r.amount>0)) errors.push(`event ${e.id}: milestone ${m.threshold} has non-positive reward amount`);
    }
  }

  if(e.type==="RACE" && !e.matchmaking) errors.push(`event ${e.id}: RACE requires matchmaking`);
  if(e.type==="PASS" && !(e.levels>0)) errors.push(`event ${e.id}: PASS requires positive levels`);
  if(e.type==="ALBUM" && !(e.cardCountDev>0)) errors.push(`event ${e.id}: ALBUM requires cardCountDev`);
  if(e.type==="ALBUM" && e.guarantee?.enabled && !(e.guarantee.pityPoints>0)) errors.push(`event ${e.id}: enabled guarantee requires pityPoints >0`);
}

console.log(JSON.stringify({
  file,
  counts:Object.fromEntries(Object.entries(byId).map(([k,v])=>[k,v.size])),
  errors,warnings,
  result:errors.length?"FAIL":"PASS"
},null,2));
process.exit(errors.length?1:0);
