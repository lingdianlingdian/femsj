#!/usr/bin/env node
import fs from "node:fs";

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
  const h=rows[0]||[];
  return rows.slice(1).filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]??""])));
}
const binding=JSON.parse(fs.readFileSync("production-data/v4/art/runtime_art_bindings_day001_110_v4.json","utf8"));
const runtime=JSON.parse(fs.readFileSync("production-data/v4/runtime/game_content_day001_110.json","utf8"));
const canon=JSON.parse(fs.readFileSync("production-data/v4/characters/character_canon_v4.json","utf8"));
const builds=JSON.parse(fs.readFileSync("production-data/v4/build/build_nodes_4areas.json","utf8"));
const assets=table("production-data/v4/art/assets_master.csv");
const outputs=JSON.parse(fs.readFileSync("production-data/v4/art/art_output_manifest_v4.json","utf8")).outputs||[];

const assetById=new Map(assets.map(x=>[x.asset_id,x]));
const outputById=new Map(outputs.map(x=>[x.asset_id,x]));
const errors=[],warnings=[];
const approved=new Set(["APPROVED","INTEGRATED"]);

function requireAsset(assetId,owner){
  const a=assetById.get(assetId);
  if(!a){errors.push(`${owner}: missing AssetId ${assetId}`);return;}
  if(!approved.has(a.status))errors.push(`${owner}: asset ${assetId} status ${a.status}`);
  const o=outputById.get(assetId);
  if(!o){errors.push(`${owner}: missing binary output ${assetId}`);return;}
  if(!approved.has(o.status))errors.push(`${owner}: output ${assetId} status ${o.status}`);
  if(!o.file_path)errors.push(`${owner}: output ${assetId} missing file_path`);
  if(!/^[a-f0-9]{64}$/.test(o.sha256||""))errors.push(`${owner}: output ${assetId} invalid sha256`);
}

const runtimeItems=new Set((runtime.items||[]).map(x=>x.id));
const runtimeProducers=new Set((runtime.producers||[]).map(x=>x.id));
const runtimeCookwares=new Set((runtime.cookwares||[]).map(x=>x.id));
const canonChars=new Set((canon.characters||[]).map(x=>x.id));
const buildIds=new Set((builds.nodes||[]).map(x=>x.build_id));

for(const id of runtimeItems){
  const a=binding.content?.items?.[id];
  if(!a)errors.push(`runtime item missing binding: ${id}`);
  else requireAsset(a,`item ${id}`);
}
for(const id of Object.keys(binding.content?.items||{}))if(!runtimeItems.has(id))warnings.push(`binding item not in runtime: ${id}`);

for(const id of runtimeProducers){
  const a=binding.content?.producers?.[id];
  if(!a)errors.push(`runtime producer missing binding: ${id}`);
  else requireAsset(a,`producer ${id}`);
}
for(const id of Object.keys(binding.content?.producers||{}))if(!runtimeProducers.has(id))errors.push(`binding producer not in runtime: ${id}`);

for(const id of runtimeCookwares){
  const a=binding.content?.cookwares?.[id];
  if(!a)errors.push(`runtime cookware missing binding: ${id}`);
  else requireAsset(a,`cookware ${id}`);
}
for(const id of Object.keys(binding.content?.cookwares||{}))if(!runtimeCookwares.has(id))errors.push(`binding cookware not in runtime: ${id}`);

for(const id of canonChars){
  const b=binding.characters?.[id];
  if(!b){errors.push(`character missing binding: ${id}`);continue;}
  for(const [role,a] of Object.entries(b))requireAsset(a,`character ${id} ${role}`);
}
for(const id of Object.keys(binding.characters||{}))if(!canonChars.has(id))errors.push(`binding character not in canon: ${id}`);

for(const id of buildIds){
  const b=binding.buildNodes?.[id];
  if(!b){errors.push(`build node missing binding: ${id}`);continue;}
  requireAsset(b.before,`build ${id} before`);
  requireAsset(b.after,`build ${id} after`);
}
for(const id of Object.keys(binding.buildNodes||{}))if(!buildIds.has(id))errors.push(`binding build node unknown: ${id}`);

for(const [k,a] of Object.entries(binding.uiShell||{}))requireAsset(a,`uiShell ${k}`);
for(const [k,a] of Object.entries(binding.vfx||{}))requireAsset(a,`vfx ${k}`);

const refs=[];
function collect(v){
  if(typeof v==="string")refs.push(v);
  else if(Array.isArray(v))v.forEach(collect);
  else if(v&&typeof v==="object")Object.values(v).forEach(collect);
}
collect(binding.uiShell);collect(binding.content);collect(binding.characters);collect(binding.buildNodes);collect(binding.vfx);

const report={
  counts:{
    runtimeItems:runtimeItems.size,
    runtimeProducers:runtimeProducers.size,
    runtimeCookwares:runtimeCookwares.size,
    characters:canonChars.size,
    buildNodes:buildIds.size,
    uniqueBoundAssets:new Set(refs).size,
    manifestAssets:assets.length,
    binaryOutputs:outputs.length
  },
  warnings,errors,
  result:errors.length?"FAIL":"PASS"
};
console.log(JSON.stringify(report,null,2));
process.exit(errors.length?1:0);
