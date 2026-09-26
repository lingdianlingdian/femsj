#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const pairs=[
  ['production-data/v4/runtime/game_content_day001_110.json','client-cocos/assets/resources/generated/game_content_day001_110.json']
];
const catalog=JSON.parse(fs.readFileSync('production-data/v4/story/story_catalog_v4.json','utf8'));
for(const s of catalog.slices||[]){
  const suffix=`day${String(s.minDay).padStart(3,'0')}_${String(s.maxDay).padStart(3,'0')}`;
  pairs.push([s.storyFile,`client-cocos/assets/resources/story/story_dialogue_${suffix}.json`]);
  pairs.push([s.localeFile,`client-cocos/assets/resources/story/locale_zh-CN_${suffix}.json`]);
}
const errors=[];
for(const [src,dst] of pairs){
  if(!fs.existsSync(dst)){errors.push(`MISSING ${dst}`);continue;}
  const a=fs.readFileSync(src),b=fs.readFileSync(dst);
  if(!b.length)errors.push(`EMPTY ${dst}`);
  else if(!a.equals(b))errors.push(`STALE ${dst} != ${src}`);
}
const runtime=JSON.parse(fs.readFileSync('client-cocos/assets/resources/generated/game_content_day001_110.json','utf8'));
if(runtime.days?.length!==110)errors.push(`runtime days=${runtime.days?.length}`);
if(runtime.orders?.length!==651)errors.push(`runtime orders=${runtime.orders?.length}`);

const sourceManifest=JSON.parse(fs.readFileSync('production-data/v4/art/art_output_manifest_v4.json','utf8'));
const importMap=JSON.parse(fs.readFileSync('client-cocos/assets/resources/generated/asset_import_map_v4.json','utf8'));
if(importMap.count!==389||importMap.assets?.length!==389)errors.push(`asset import count=${importMap.count}/${importMap.assets?.length}`);
const sourceById=new Map((sourceManifest.outputs||[]).map(x=>[x.asset_id,x]));
for(const entry of importMap.assets||[]){
  const source=sourceById.get(entry.assetId);
  if(!source){errors.push(`UNKNOWN ASSET ${entry.assetId}`);continue;}
  const target=entry.targetFile;
  if(!fs.existsSync(target)){errors.push(`MISSING BINARY ${target}`);continue;}
  const hash=crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
  if(hash!==source.sha256)errors.push(`HASH MISMATCH ${entry.assetId}`);
  if(entry.sourcePath!==source.file_path)errors.push(`SOURCE PATH MISMATCH ${entry.assetId}`);
}
const storyFiles=pairs.filter(x=>x[1].includes('/story/story_dialogue_')).length;
const localeFiles=pairs.filter(x=>x[1].includes('/story/locale_')).length;
if(storyFiles!==11||localeFiles!==11)errors.push(`story resources=${storyFiles}/${localeFiles}`);
console.log(JSON.stringify({
  runtimeDays:runtime.days?.length,
  runtimeOrders:runtime.orders?.length,
  storySlices:storyFiles,
  localeSlices:localeFiles,
  approvedArtBinaries:(importMap.assets||[]).length,
  errors
},null,2));
process.exit(errors.length?1:0);
