#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT=process.cwd();
const CHECK=process.argv.includes("--check");
const P=(...xs)=>path.join(ROOT,...xs);

const paths={
  items:P("production-data/v4/content/items_seed_public.csv"),
  assets:P("production-data/v4/art/assets_master.csv"),
  graph:P("production-data/v4/content/transform_graph_verified_v4.json"),
  registry:P("production-data/v4/levels/order_registry_110.json"),
  verified:P("production-data/v4/levels/order_requirements_verified.json"),
  blueprint:P("research-data/levels/level_blueprint_110.json"),
  publicOutputs:P("production-data/v4/content/producer_outputs_public.csv"),
  chars:P("production-data/v4/characters/character_canon_v4.json"),
  builds:P("production-data/v4/build/build_nodes_4areas.json"),
  events:P("production-data/v4/events/events_v4.json"),
  beats:P("production-data/v4/story/story_beats_110.csv"),
  outConfig:P("production-data/v4/runtime/game_content_day001_110.json"),
  outReport:P("production-data/v4/runtime/game_content_day001_110_report.json")
};

function parseCSV(text){
  const rows=[];let row=[],field="",quoted=false;
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
function table(file){
  const rows=parseCSV(fs.readFileSync(file,"utf8"));
  const header=rows[0]||[];
  return rows.slice(1).filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]??""])));
}
function readJSON(file){return JSON.parse(fs.readFileSync(file,"utf8"));}
function hash(s){let h=2166136261>>>0;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function combineReqs(xs){
  const m=new Map();
  for(const x of xs||[]){if(!x?.itemId)continue;m.set(x.itemId,(m.get(x.itemId)||0)+Number(x.count||1));}
  return [...m.entries()].map(([itemId,count])=>({itemId,count}));
}
function devEvidence(note){
  return {kind:"DEV_BLUEPRINT",confidence:"D",sourceIds:[],observedAt:null,channel:null,versionSensitive:true,note};
}
function stableJSON(v){return JSON.stringify(v,null,2)+"\n";}

const itemRows=table(paths.items);
const assetRows=table(paths.assets);
const graph=readJSON(paths.graph);
const registry=readJSON(paths.registry);
const verified=readJSON(paths.verified);
const blueprintRaw=readJSON(paths.blueprint);
const publicOutputs=table(paths.publicOutputs);
const chars=readJSON(paths.chars).characters||[];
const buildSrc=readJSON(paths.builds).nodes||[];
const events=readJSON(paths.events).events||[];
const beatRows=table(paths.beats);
const blueprint=Array.isArray(blueprintRaw)?blueprintRaw:(blueprintRaw.days||[]);

const itemById=new Map(itemRows.map(x=>[x.item_id,x]));
const assetSet=new Set(assetRows.map(x=>x.asset_id).filter(Boolean));
const assetByContent=new Map();
for(const r of assetRows){
  const note=r.notes||"";
  const m=note.match(/关联内容ID\s+([a-z0-9_.-]+)/);
  if(m)assetByContent.set(m[1],r.asset_id);
}
function assetForItem(id){
  const direct=itemById.get(id)?.asset_id;
  const candidate=direct||assetByContent.get(id)||`art_${id}`;
  if(!assetSet.has(candidate))throw new Error(`Missing formal AssetId for ${id}: ${candidate}`);
  return candidate;
}

const knownDay=new Map();
function touchDay(id,day){
  const d=Number(day);
  if(!id||!Number.isFinite(d))return;
  knownDay.set(id,Math.min(knownDay.get(id)??999,Math.max(1,Math.min(110,d))));
}
for(const row of verified.rows||[])for(const x of row.requirements||[])touchDay(x.itemId,row.day);
for(const row of graph.relations||[]){
  if(row.day){touchDay(row.outputItemId,row.day);for(const x of row.inputs||[])touchDay(x.itemId,row.day);}
}
for(const row of graph.directItems||[]){
  if(row.day){touchDay(row.outputItemId,row.day);for(const x of row.inputs||[])touchDay(x.itemId,row.day);}
}
for(const row of publicOutputs)if(row.observed_day)touchDay(row.output_item_id,row.observed_day);
for(const row of itemRows)if(row.unlock_day)touchDay(row.item_id,row.unlock_day);

const items=itemRows.map((x,i)=>{
  const fallback=1+Math.floor((i/Math.max(1,itemRows.length-1))*99);
  const unlockDay=knownDay.get(x.item_id)??fallback;
  return {
    id:x.item_id,
    name:x.name,
    type:x.type,
    chainId:x.chain_id||null,
    level:x.level?Number(x.level):null,
    unlockDay,
    sellValue:Math.max(0,Math.floor(unlockDay*1.5)),
    tags:["FULL_RUNTIME",x.evidence_status||"UNRESOLVED"],
    assetId:assetForItem(x.item_id),
    evidence:devEvidence(`Item identity seeded from ${x.evidence_status||"research"}; unlock/sell values and runtime asset binding are original production defaults.`)
  };
});
const itemRuntime=new Map(items.map(x=>[x.id,x]));

const transformations=[];
for(const r of (graph.relations||[]).filter(x=>x.relationType==="MERGE2")){
  if(!itemRuntime.has(r.outputItemId)||!(r.inputs||[]).every(x=>itemRuntime.has(x.itemId)))continue;
  transformations.push({
    id:r.id,
    type:"MERGE2",
    inputs:combineReqs(r.inputs),
    toolId:null,
    durationSec:0,
    outputs:[{type:"ITEM",id:r.outputItemId,amount:1}],
    evidence:devEvidence(`Executable MERGE2; relation seeded from ${r.evidence?.kind||"research"} evidence. Runtime timing is zero-second merge.`)
  });
}
for(const [id,input,output] of [
  ["tr_rt_coffee_espresso","item_kafeidou","item_nongsuokafei"],
  ["tr_rt_coffee_cup","item_nongsuokafei","item_kafei"],
  ["tr_rt_coffee_portable","item_kafei","item_bianxiekafei"],
  ["tr_rt_coffee_iced","item_bianxiekafei","item_bingkafei"]
]){
  if(itemRuntime.has(input)&&itemRuntime.has(output)&&!transformations.some(x=>x.id===id)){
    transformations.push({
      id,type:"MERGE2",inputs:[{itemId:input,count:2}],toolId:null,durationSec:0,
      outputs:[{type:"ITEM",id:output,amount:1}],
      evidence:devEvidence("Original executable coffee Merge-2 chain used by the production runtime.")
    });
  }
}
const mergeOutputs=new Set(transformations.flatMap(x=>x.outputs||[]).filter(x=>x.type==="ITEM").map(x=>x.id));

const producerMeta=[
  ["prod_shucaileizi","蔬菜篮子",40,90],
  ["prod_bingxiang","冰箱",28,180],
  ["prod_shuiguolanzi","水果篮子",24,180],
  ["prod_yinliaogui","饮料柜",32,120],
  ["prod_coffee_counter","咖啡补给台",28,120],
  ["prod_grain_crate","谷物补给箱",24,150],
  ["prod_prep_supply","备菜耗材箱",12,180],
  ["prod_kitchen_supply","厨房补给箱",28,180],
  ["prod_binggui","冰柜",26,210],
  ["prod_xianrouxiaoshou","鲜肉销售",24,240],
  ["prod_guopen","果盆",26,180],
  ["prod_haitiaogongju","海钓工具",22,300],
  ["prod_jiushuiyinliaotai","酒水饮料台",28,180],
  ["prod_wugumicang","五谷米仓",32,180]
];
const producerMetaMap=new Map(producerMeta.map(x=>[x[0],x]));
const knownProducerByItem=new Map();
for(const r of publicOutputs){
  if(!producerMetaMap.has(r.producer_id)||!r.output_item_id)continue;
  if(!knownProducerByItem.has(r.output_item_id))knownProducerByItem.set(r.output_item_id,r.producer_id);
}
function chooseProducer(x){
  if(knownProducerByItem.has(x.id))return knownProducerByItem.get(x.id);
  const n=x.name||"";
  if(x.id==="item_kafeidou"||/^item_(nongsuokafei|kafei|bianxiekafei|bingkafei)$/.test(x.id))return "prod_coffee_counter";
  if(["item_yumili","item_yumi","item_yumisui","item_dami","item_xiaomaifen","item_yanmai"].includes(x.id))return "prod_grain_crate";
  if(["item_boliwan","item_zhishipian"].includes(x.id))return "prod_prep_supply";
  if(x.type==="COOKWARE"||x.type==="SPECIAL")return "prod_kitchen_supply";
  if(/虾|鱼|蟹|蚝|贝|鱿|海鲜|鳕|金枪/.test(n))return "prod_haitiaogongju";
  if(/肉|鸡|肘|培根|香肠|肉丸|牛胸|五花/.test(n))return "prod_xianrouxiaoshou";
  if(/蓝莓|草莓|柠檬|芒果|葡萄|梨|桃|橙|苹果|果/.test(n))return x.unlockDay>=70?"prod_guopen":"prod_shuiguolanzi";
  if(/酒|朗姆|威士忌|伏特加|龙舌兰|可乐|苏打|汤力/.test(n))return x.unlockDay>=65?"prod_jiushuiyinliaotai":"prod_yinliaogui";
  if(/茶|水|饮|奶茶/.test(n))return "prod_yinliaogui";
  if(/奶|黄油|芝士|冰块|奶油/.test(n))return x.unlockDay>=70?"prod_binggui":"prod_bingxiang";
  if(/番茄|椒|蘑菇|胡萝卜|洋葱|葱|生菜|西兰花|土豆|蒜|香菇|甘蓝/.test(n))return "prod_shucaileizi";
  return "prod_kitchen_supply";
}
const pools=new Map(producerMeta.map(x=>[x[0],[]]));
for(const x of items){
  if(x.type==="DISH"||mergeOutputs.has(x.id))continue;
  pools.get(chooseProducer(x)).push(x);
}
const producers=[];
for(const [id,name,capacity,cooldownSec] of producerMeta){
  const pool=(pools.get(id)||[]).sort((a,b)=>a.unlockDay-b.unlockDay||a.id.localeCompare(b.id));
  if(!pool.length)continue;
  const assetId=`art_prod_${id.replace(/^prod_/,"")}`;
  if(!assetSet.has(assetId))throw new Error(`Missing producer AssetId ${assetId}`);
  const unlockDay=Math.max(1,Math.min(...pool.map(x=>x.unlockDay)));
  producers.push({
    id,name,level:1,energyCost:1,capacity,cooldownSec,
    outputPool:pool.map(x=>({itemId:x.id,weight:10+(hash(id+"|"+x.id)%11),minCount:1,maxCount:1})),
    upgradeTo:null,unlockDay,tags:["FULL_RUNTIME","DEV_DEFAULT"],assetId,
    evidence:devEvidence("Producer identity may be research-seeded; energy/capacity/cooldown/weights and any unverified item assignment are original runtime defaults.")
  });
}
const producerByItem=new Map();
for(const p of producers)for(const o of p.outputPool||[]){
  if(!producerByItem.has(o.itemId))producerByItem.set(o.itemId,[]);
  producerByItem.get(o.itemId).push(p.id);
}

const cookwareMeta=[
  ["cook_grill","烤架"],
  ["cook_prep_station","备菜台"],
  ["cook_soup_pot","汤锅"],
  ["cook_oven","烤箱"],
  ["cook_drink_station","饮品调制台"]
];
const cookwareIdSet=new Set(cookwareMeta.map(x=>x[0]));
function chooseCookware(name,tool){
  if(tool&&cookwareIdSet.has(tool))return tool;
  if(/汤|羹|锅/.test(name))return "cook_soup_pot";
  if(/饮|汁|茶|咖啡|酒|苏打|可乐|水/.test(name))return "cook_drink_station";
  if(/烤|炭|烟熏|热狗|肘|鸡/.test(name))return "cook_grill";
  if(/包|饺|糕|面包|三明治/.test(name))return "cook_oven";
  return "cook_prep_station";
}
const relByOutput=new Map();
for(const r of (graph.relations||[]).filter(x=>x.relationType!=="MERGE2")){
  if(!r.outputItemId)continue;
  if(!relByOutput.has(r.outputItemId))relByOutput.set(r.outputItemId,[]);
  relByOutput.get(r.outputItemId).push(r);
}
for(const rs of relByOutput.values())rs.sort((a,b)=>{
  const da=a.durationSec==null?1:0,db=b.durationSec==null?1:0;
  if(da!==db)return da-db;
  const ca=a.relationType==="COOK_CONFIRMED"?0:1,cb=b.relationType==="COOK_CONFIRMED"?0:1;
  if(ca!==cb)return ca-cb;
  return Number(a.day||999)-Number(b.day||999);
});
const sourceable=items.filter(x=>x.type!=="DISH"&&!mergeOutputs.has(x.id)).sort((a,b)=>a.unlockDay-b.unlockDay||a.id.localeCompare(b.id));
function generatedInputs(dish){
  const available=sourceable.filter(x=>x.unlockDay<=dish.unlockDay&&x.type!=="COOKWARE");
  const pool=available.length>=3?available:sourceable;
  const count=2+(hash(dish.id)%2);
  const out=[],used=new Set();
  let idx=hash("input|"+dish.id)%pool.length;
  const step=7+(hash("step|"+dish.id)%11);
  for(let i=0;i<count&&used.size<pool.length;i++){
    for(let g=0;g<pool.length;g++){
      const x=pool[idx%pool.length];idx=(idx+step)%pool.length;
      if(!used.has(x.id)){used.add(x.id);out.push({itemId:x.id,count:1});break;}
    }
  }
  return out;
}
const recipes=[];
for(const dish of items.filter(x=>x.type==="DISH")){
  const rel=(relByOutput.get(dish.id)||[])[0]||null;
  let inputs=rel?combineReqs((rel.inputs||[]).filter(x=>itemRuntime.get(x.itemId)?.type!=="COOKWARE")):generatedInputs(dish);
  if(!inputs.length)inputs=generatedInputs(dish);
  inputs=inputs.slice(0,10);
  let unlockDay=dish.unlockDay;
  for(const x of inputs)unlockDay=Math.max(unlockDay,itemRuntime.get(x.itemId)?.unlockDay||1);
  dish.unlockDay=unlockDay;
  const publicDuration=rel?.durationSec!=null?Number(rel.durationSec):null;
  recipes.push({
    id:`recipe_rt_${dish.id.replace(/^dish_/,"")}`,
    name:dish.name,
    cookwareId:chooseCookware(dish.name,rel?.toolId),
    inputs,
    outputItemId:dish.id,
    durationSec:publicDuration??Math.min(2400,30+inputs.reduce((a,x)=>a+x.count,0)*25+Math.floor(unlockDay/10)*20),
    unlockDay,
    speedupGemPerMin:Number((0.35+Math.min(0.65,unlockDay/200)).toFixed(2)),
    evidence:devEvidence(rel
      ?`Executable recipe. Ingredient relation seeded from ${rel.evidence?.kind||"public research"}${publicDuration!=null?"; evidence duration retained":""}; remaining runtime parameters are original defaults.`
      :"Original executable recipe created to close the production runtime.")
  });
}
const recipeByOutput=new Map(recipes.map(x=>[x.outputItemId,x]));
const cookwares=cookwareMeta.map(([id,name])=>{
  const used=recipes.filter(r=>r.cookwareId===id);
  const assetId=`art_cook_${id.replace(/^cook_/,"")}`;
  if(!assetSet.has(assetId))throw new Error(`Missing cookware AssetId ${assetId}`);
  return {
    id,name,level:1,queueSize:id==="cook_prep_station"?2:1,
    unlockDay:used.length?Math.min(...used.map(x=>x.unlockDay)):1,
    speedModifier:1,assetId,
    evidence:devEvidence("Cookware identity may be research-seeded; level/queue/speed/unlock are original runtime defaults.")
  };
});

const transformByOutput=new Map();
for(const t of transformations)for(const o of t.outputs||[])if(o.type==="ITEM")transformByOutput.set(o.id,t);
function depsForItem(id,seen=new Set()){
  if(seen.has(id))return {producers:[],recipes:[],cookwares:[]};
  seen.add(id);
  if(producerByItem.has(id))return {producers:producerByItem.get(id),recipes:[],cookwares:[]};
  const t=transformByOutput.get(id);
  if(t){
    const parts=(t.inputs||[]).map(x=>depsForItem(x.itemId,new Set(seen)));
    return {producers:[...new Set(parts.flatMap(x=>x.producers))],recipes:[...new Set(parts.flatMap(x=>x.recipes))],cookwares:[...new Set(parts.flatMap(x=>x.cookwares))]};
  }
  const r=recipeByOutput.get(id);
  if(r){
    const parts=(r.inputs||[]).map(x=>depsForItem(x.itemId,new Set(seen)));
    return {producers:[...new Set(parts.flatMap(x=>x.producers))],recipes:[r.id,...new Set(parts.flatMap(x=>x.recipes))],cookwares:[r.cookwareId,...new Set(parts.flatMap(x=>x.cookwares))]};
  }
  return {producers:[],recipes:[],cookwares:[]};
}

const verifiedByOrder=new Map((verified.rows||[]).map(x=>[x.orderId,x]));
const bpByDay=new Map(blueprint.map(x=>[Number(x.day),x]));
const charIds=chars.filter(x=>x.id!=="char_manager_001").map(x=>x.id);
if(!charIds.length)throw new Error("No customer character IDs");
const buildNodes=buildSrc.map(b=>({
  id:b.build_id,areaId:b.area_id,stage:Number(b.node_index),prerequisites:b.prerequisite?[b.prerequisite]:[],
  coinCost:Number(b.coin_cost_dev||0),unlockDay:Number(b.unlock_day),assetBefore:b.asset_before,assetAfter:b.asset_after,
  storyId:b.story_trigger||null,rewards:[{type:"ENERGY",amount:5+Math.min(20,Number(b.node_index||1)*2)}],
  evidence:devEvidence("Original four-area build runtime configuration.")
}));
const buildByDay=new Map();
for(const b of buildNodes){if(!buildByDay.has(b.unlockDay))buildByDay.set(b.unlockDay,[]);buildByDay.get(b.unlockDay).push(b);}
const beatByDay=new Map(beatRows.map(x=>[Number(x.day),x]));
const ordersByDay=new Map();
for(const o of registry.orders||[]){if(!ordersByDay.has(Number(o.day)))ordersByDay.set(Number(o.day),[]);ordersByDay.get(Number(o.day)).push(o);}
for(const xs of ordersByDay.values())xs.sort((a,b)=>Number(a.slot)-Number(b.slot));

function candidatesForDay(day,type){
  return items.filter(x=>x.unlockDay<=day&&x.type!=="COOKWARE"&&x.type!=="SPECIAL"&&(!type||x.type===type)).sort((a,b)=>a.unlockDay-b.unlockDay||a.id.localeCompare(b.id));
}
function generatedRequirements(orderId,day){
  const all=candidatesForDay(day,null);
  if(!all.length)throw new Error(`No requirement candidates Day ${day}`);
  const wantDish=day>=5&&(hash(orderId)%100)<Math.min(78,25+Math.floor(day/2));
  const n=1+(day>=12?1:0)+(day>=55&&hash("n|"+orderId)%3===0?1:0);
  const selected=[],used=new Set();
  function add(pool,seed){
    if(!pool.length)return false;
    let idx=hash(seed)%pool.length;const step=5+(hash(seed+"|step")%13);
    for(let g=0;g<pool.length;g++){
      const x=pool[idx%pool.length];idx=(idx+step)%pool.length;
      if(!used.has(x.id)){used.add(x.id);selected.push(x);return true;}
    }
    return false;
  }
  add(candidatesForDay(day,wantDish?"DISH":"INGREDIENT"),orderId+"|first");
  while(selected.length<n&&selected.length<all.length)if(!add(all,orderId+"|"+selected.length))break;
  return selected.slice(0,3).map((x,i)=>({itemId:x.id,count:(day>=85&&i===0&&x.type==="INGREDIENT"&&hash("count|"+orderId)%4===0)?2:1}));
}

const orders=[];
const dayEconomy=new Map();
for(let day=1;day<=110;day++){
  const rows=ordersByDay.get(day)||[];
  if(!rows.length)throw new Error(`Day ${day} has no Order Registry slots`);
  const bp=bpByDay.get(day)||{};
  const draft=[];
  let complexityTotal=0;
  for(const row of rows){
    const vr=verifiedByOrder.get(row.order_id);
    const requirements=vr?combineReqs(vr.requirements):generatedRequirements(row.order_id,day);
    if(!requirements.length)throw new Error(`Order ${row.order_id} empty requirements`);
    const deps=requirements.map(x=>depsForItem(x.itemId));
    const producerIds=[...new Set(deps.flatMap(x=>x.producers))];
    const recipeIds=[...new Set(deps.flatMap(x=>x.recipes))];
    const cookwareIds=[...new Set(deps.flatMap(x=>x.cookwares))];
    const dishCount=requirements.filter(x=>itemRuntime.get(x.itemId)?.type==="DISH").length;
    const complexity=requirements.reduce((a,x)=>a+x.count,0)+dishCount*1.5+recipeIds.length*.5;
    complexityTotal+=complexity;
    draft.push({row,vr,requirements,producerIds,recipeIds,cookwareIds,dishCount,complexity});
  }
  const buildCost=(buildByDay.get(day)||[]).reduce((a,b)=>a+b.coinCost,0);
  const targetCoin=Math.max(rows.length*(50+day*20),Math.ceil(buildCost*1.35));
  let allocated=0;
  for(let i=0;i<draft.length;i++){
    const d=draft[i];
    const reward=i===draft.length-1?Math.max(1,targetCoin-allocated):Math.max(1,Math.floor(targetCoin*d.complexity/(complexityTotal||1)));
    allocated+=reward;
    const dayP50=Number(bp.dev_target_energy_p50||Math.round(25+day*5));
    const dayP90=Math.max(dayP50,Number(bp.dev_target_energy_p90||Math.round(dayP50*1.25)));
    const avg=complexityTotal/Math.max(1,draft.length);
    const factor=d.complexity/Math.max(.5,avg);
    const energyP50=Math.max(1,Math.round(dayP50/draft.length*factor));
    const energyP90=Math.max(energyP50,Math.round(dayP90/draft.length*factor));
    const cookWaitSec=d.recipeIds.reduce((sum,id)=>sum+(recipes.find(r=>r.id===id)?.durationSec||0),0);
    const producerBlockSec=d.producerIds.reduce((m,id)=>Math.max(m,producers.find(p=>p.id===id)?.cooldownSec||0),0);
    orders.push({
      id:d.row.order_id,day,slot:Number(d.row.slot),
      customerId:charIds[hash(d.row.order_id)%charIds.length],
      requirements:d.requirements,
      rewards:[{type:"COIN",amount:reward}],
      producerIds:d.producerIds,recipeIds:d.recipeIds,cookwareIds:d.cookwareIds,
      difficulty:{
        energyP50,energyP90,cookWaitSec,producerBlockSec,
        peakCells:Math.min(63,Math.max(3,4+d.requirements.length*3+Math.floor(day/12))),
        manualActions:Math.max(4,Math.round(energyP50*1.4+d.requirements.length*2)),
        byproductUtilization:Number(Math.max(.45,.68-day*.0015).toFixed(2))
      },
      evidence:devEvidence(d.vr
        ?`Requirements are evidence-backed (${d.vr.evidence?.kind||"PUBLIC"}); customer/reward/dependencies/difficulty are original runtime values.`
        :"Requirements and all runtime fields are original DEV_BLUEPRINT for a public-unresolved order slot.")
    });
  }
  dayEconomy.set(day,{targetCoin,allocatedCoin:allocated,buildCost});
}

const unlockByDay=new Map();
for(const p of producers){if(!unlockByDay.has(p.unlockDay))unlockByDay.set(p.unlockDay,[]);unlockByDay.get(p.unlockDay).push(p.id);}
for(const c of cookwares){if(!unlockByDay.has(c.unlockDay))unlockByDay.set(c.unlockDay,[]);unlockByDay.get(c.unlockDay).push(c.id);}
const eventByDay=new Map();
for(const e of events){if(!eventByDay.has(Number(e.unlockDay)))eventByDay.set(Number(e.unlockDay),[]);eventByDay.get(Number(e.unlockDay)).push(e.id);}
const days=[];
for(let day=1;day<=110;day++){
  const beat=beatByDay.get(day);
  if(!beat)throw new Error(`Missing Story Beat Day ${day}`);
  const orderIds=(ordersByDay.get(day)||[]).map(x=>x.order_id);
  days.push({
    id:`day_${String(day).padStart(3,"0")}`,day,
    parallelSlots:Math.min(8,Math.max(1,Math.min(orderIds.length,4+Math.floor((day-1)/30)))),
    orderIds,
    unlockIds:[...new Set(unlockByDay.get(day)||[])],
    buildNodeIds:(buildByDay.get(day)||[]).map(x=>x.id),
    storyBefore:beat.entry_story_id,
    storyAfter:beat.exit_story_id,
    eventHooks:eventByDay.get(day)||[],
    rewards:[{type:"ENERGY",amount:10+Math.floor(day/20)*5}],
    evidence:devEvidence("110-day runtime day configuration combining stable Order Registry, original progression defaults, build nodes and original story hooks.")
  });
}

const config={configVersion:"4.2.0",items,transformations,producers,cookwares,recipes,orders,days,buildNodes,events};

const ids={
  items:new Set(items.map(x=>x.id)),
  producers:new Set(producers.map(x=>x.id)),
  cookwares:new Set(cookwares.map(x=>x.id)),
  recipes:new Set(recipes.map(x=>x.id)),
  orders:new Set(orders.map(x=>x.id)),
  builds:new Set(buildNodes.map(x=>x.id)),
  events:new Set(events.map(x=>x.id))
};
const errors=[];
for(const t of transformations){
  for(const x of t.inputs||[])if(!ids.items.has(x.itemId))errors.push(`Transformation ${t.id} missing input ${x.itemId}`);
  for(const x of t.outputs||[])if(x.type==="ITEM"&&!ids.items.has(x.id))errors.push(`Transformation ${t.id} missing output item ${x.id}`);
}
for(const p of producers)for(const x of p.outputPool||[])if(!ids.items.has(x.itemId))errors.push(`Producer ${p.id} missing item ${x.itemId}`);
for(const r of recipes){
  if(!ids.cookwares.has(r.cookwareId))errors.push(`Recipe ${r.id} missing cookware ${r.cookwareId}`);
  if(!ids.items.has(r.outputItemId))errors.push(`Recipe ${r.id} missing output ${r.outputItemId}`);
  for(const x of r.inputs)if(!ids.items.has(x.itemId))errors.push(`Recipe ${r.id} missing input ${x.itemId}`);
}
for(const o of orders){
  for(const x of o.requirements)if(!ids.items.has(x.itemId))errors.push(`Order ${o.id} missing item ${x.itemId}`);
  for(const x of o.producerIds||[])if(!ids.producers.has(x))errors.push(`Order ${o.id} missing producer ${x}`);
  for(const x of o.recipeIds||[])if(!ids.recipes.has(x))errors.push(`Order ${o.id} missing recipe ${x}`);
  for(const x of o.cookwareIds||[])if(!ids.cookwares.has(x))errors.push(`Order ${o.id} missing cookware ${x}`);
  for(const x of o.requirements){
    const d=depsForItem(x.itemId);
    if(!d.producers.length)errors.push(`Order ${o.id} item ${x.itemId} has no producer path`);
  }
}
for(const d of days){
  for(const x of d.orderIds)if(!ids.orders.has(x))errors.push(`Day ${d.day} missing order ${x}`);
  for(const x of d.buildNodeIds)if(!ids.builds.has(x))errors.push(`Day ${d.day} missing build ${x}`);
  for(const x of d.eventHooks||[])if(!ids.events.has(x))errors.push(`Day ${d.day} missing event ${x}`);
}
if(orders.length!==(registry.orders||[]).length)errors.push(`Order count ${orders.length} != registry ${registry.orders?.length}`);
if(days.length!==110)errors.push(`Day count ${days.length} != 110`);
if(buildNodes.length!==48)errors.push(`Build count ${buildNodes.length} != 48`);

const verifiedCount=orders.filter(x=>x.evidence.note.startsWith("Requirements are evidence-backed")).length;
const report={
  version:"4.2.0",
  generatedAt:"2026-09-25",
  counts:{
    items:items.length,transformations:transformations.length,producers:producers.length,cookwares:cookwares.length,
    recipes:recipes.length,orders:orders.length,days:days.length,buildNodes:buildNodes.length,events:events.length,
    verifiedRequirementOrders:verifiedCount,devBlueprintOrders:orders.length-verifiedCount
  },
  closure:{
    missingItemAssets:items.filter(x=>!assetSet.has(x.assetId)).length,
    referenceErrors:errors.length,
    orderRegistryMatch:orders.length===(registry.orders||[]).length,
    dayCoverage:days.length===110,
    storyHookCoverage:days.every(x=>x.storyBefore&&x.storyAfter),
    buildCoverage:buildNodes.length===48
  },
  producerPools:Object.fromEntries(producers.map(p=>[p.id,p.outputPool.length])),
  economy:{
    totalOrderCoin:[...dayEconomy.values()].reduce((a,x)=>a+x.allocatedCoin,0),
    totalBuildCoin:buildNodes.reduce((a,x)=>a+x.coinCost,0),
    endingNominalCoin:[...dayEconomy.values()].reduce((a,x)=>a+x.allocatedCoin-x.buildCost,0)
  },
  errors,
  caveats:[
    "Exact Producer weights/capacity/cooldown are DEV_BLUEPRINT unless separately evidenced.",
    "Untranscribed Order requirements are original DEV_BLUEPRINT and are not claims about competitor menus.",
    "Recipes without complete public execution parameters use original cookware/duration/speedup defaults.",
    "This executable runtime is separate from research evidence tables; evidence-backed and original fields must not be conflated."
  ]
};

return {config,report};
}

const {config,report}=build();
if(report.errors.length)throw new Error(`Runtime closure failed with ${report.errors.length} errors:\n`+report.errors.slice(0,50).join("\n"));

const configText=stableJSON(config);
const reportText=stableJSON(report);
if(CHECK){
  const checks=[[paths.outConfig,configText],[paths.outReport,reportText]];
  let failed=false;
  for(const [file,expected] of checks){
    if(!fs.existsSync(file)){console.error("MISSING",path.relative(ROOT,file));failed=true;continue;}
    const actual=fs.readFileSync(file,"utf8");
    if(actual!==expected){console.error("STALE",path.relative(ROOT,file));failed=true;}
    else console.log("PASS",path.relative(ROOT,file));
  }
  process.exit(failed?1:0);
}
fs.mkdirSync(path.dirname(paths.outConfig),{recursive:true});
fs.writeFileSync(paths.outConfig,configText);
fs.writeFileSync(paths.outReport,reportText);
console.log(JSON.stringify({written:[path.relative(ROOT,paths.outConfig),path.relative(ROOT,paths.outReport)],summary:report.counts,closure:report.closure,economy:report.economy},null,2));
