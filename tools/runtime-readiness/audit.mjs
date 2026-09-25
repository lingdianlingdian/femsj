#!/usr/bin/env node
import fs from "node:fs";

const strict=process.argv.includes("--strict");
const read=p=>fs.readFileSync(p,"utf8");
function parseCSV(text){
  const rows=[]; let row=[],field="",quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(quoted){
      if(c==='"'&&n==='"'){field+='"';i++;}
      else if(c==='"')quoted=false;
      else field+=c;
    }else{
      if(c==='"')quoted=true;
      else if(c===','){row.push(field);field="";}
      else if(c==='\n'){row.push(field);rows.push(row);row=[];field="";}
      else if(c!=='\r')field+=c;
    }
  }
  if(field.length||row.length){row.push(field);rows.push(row);}
  return rows;
}
function table(path){
  const rows=parseCSV(read(path));
  const header=rows[0]||[];
  return rows.slice(1).filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]??""])));
}
const registry=JSON.parse(read("production-data/v4/levels/order_registry_110.json"));
const verified=JSON.parse(read("production-data/v4/levels/order_requirements_verified.json"));
const producers=table("production-data/v4/content/producers_master_public.csv");
const outputs=table("production-data/v4/content/producer_outputs_public.csv");
const cookwares=table("production-data/v4/content/cookware_seed_public.csv");
const graph=JSON.parse(read("production-data/v4/content/transform_graph_verified_v4.json"));
const events=JSON.parse(read("production-data/v4/events/events_v4.json"));
const builds=JSON.parse(read("production-data/v4/build/build_nodes_4areas.json"));

const blockers=[], warnings=[];
const block=(id,area,count,reason)=>{if(count>0)blockers.push({id,area,count,reason});};
const warn=(id,area,count,reason)=>{if(count>0)warnings.push({id,area,count,reason});};

const orders=registry.orders||[];
const verifiedRows=verified.rows||[];
block("ORDER_REQUIREMENTS_UNVERIFIED","ORDER",orders.length-verifiedRows.length,
  "Orders without evidence-backed normalized requirements.");
block("ORDER_CUSTOMER_UNRESOLVED","ORDER",orders.filter(x=>!x.customer_id).length,
  "Order customer assignment is unresolved.");
block("ORDER_REWARD_UNRESOLVED","ORDER",orders.filter(x=>x.reward_coin===""||x.reward_coin==null).length,
  "Order reward is unresolved.");
block("ORDER_DEPENDENCY_UNRESOLVED","ORDER",orders.filter(x=>!x.producer_ids&&!x.recipe_ids&&!x.cookware_ids).length,
  "Order producer/recipe/cookware dependency set is unresolved.");

block("PRODUCER_LEVEL_UNRESOLVED","PRODUCER",producers.filter(x=>!x.level).length,"Producer level missing.");
block("PRODUCER_ENERGY_UNRESOLVED","PRODUCER",producers.filter(x=>!x.energy_cost).length,"Producer energy cost missing.");
block("PRODUCER_CAPACITY_UNRESOLVED","PRODUCER",producers.filter(x=>!x.capacity).length,"Producer capacity missing.");
block("PRODUCER_COOLDOWN_UNRESOLVED","PRODUCER",producers.filter(x=>!x.cooldown_sec).length,"Producer cooldown missing.");
block("PRODUCER_UNLOCK_UNRESOLVED","PRODUCER",producers.filter(x=>!x.unlock_day).length,"Producer unlock day missing.");
block("PRODUCER_WEIGHT_UNRESOLVED","PRODUCER",outputs.filter(x=>!x.weight).length,"Producer output weight missing.");

block("COOKWARE_LEVEL_UNRESOLVED","COOKWARE",cookwares.filter(x=>!x.level).length,"Cookware level missing.");
block("COOKWARE_QUEUE_UNRESOLVED","COOKWARE",cookwares.filter(x=>!x.queue_size).length,"Cookware queue size missing.");
block("COOKWARE_SPEED_UNRESOLVED","COOKWARE",cookwares.filter(x=>!x.speed_modifier).length,"Cookware speed modifier missing.");
block("COOKWARE_UNLOCK_UNRESOLVED","COOKWARE",cookwares.filter(x=>!x.unlock_day).length,"Cookware unlock day missing.");

const runtimeTransforms=(graph.relations||[]).filter(x=>x.relationType!=="MERGE2");
block("TRANSFORM_TOOL_UNRESOLVED","RECIPE",runtimeTransforms.filter(x=>!x.toolId).length,
  "Non-merge transformation has no cookware/tool mapping.");
block("TRANSFORM_DURATION_UNRESOLVED","RECIPE",runtimeTransforms.filter(x=>x.durationSec==null).length,
  "Non-merge transformation has no exact duration.");

warn("BUILD_TUNING_DEV_BLUEPRINT","BUILD",(builds.nodes||[]).filter(x=>x.status==="DEV_BLUEPRINT").length,
  "Build nodes are executable original defaults but still require balance tuning before release.");
warn("EVENT_TUNING_DEV_BLUEPRINT","LIVEOPS",(events.events||[]).filter(x=>x.evidence?.kind==="DEV_BLUEPRINT").length,
  "LiveOps parameters are original development defaults and require staged tuning.");

const summary={
  orders:{total:orders.length,verifiedRequirements:verifiedRows.length},
  producers:{total:producers.length,outputs:outputs.length},
  cookwares:{total:cookwares.length},
  transformations:{total:(graph.relations||[]).length,runtimeNonMerge:runtimeTransforms.length,directItems:(graph.directItems||[]).length},
  buildNodes:{total:(builds.nodes||[]).length},
  events:{total:(events.events||[]).length},
  blockerCount:blockers.reduce((a,x)=>a+x.count,0),
  blockerKinds:blockers.length,
  warningCount:warnings.reduce((a,x)=>a+x.count,0),
  productionReady:blockers.length===0
};
const result={
  version:"4.0",
  mode:strict?"STRICT":"REPORT",
  generatedAt:new Date().toISOString(),
  summary,
  blockers,
  warnings,
  result:blockers.length?"NOT_READY":"READY"
};
console.log(JSON.stringify(result,null,2));
process.exit(strict&&blockers.length?1:0);
