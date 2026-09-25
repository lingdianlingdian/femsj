#!/usr/bin/env node
import fs from "node:fs";

const P={
  canon:"production-data/v4/characters/character_canon_v4.json",
  schema:"schemas/v4/character_canon.schema.json",
  assets:"production-data/v4/art/assets_master.csv",
  layout:"production-data/v4/build/street_layout_4areas.json",
  builds:"production-data/v4/build/build_nodes_4areas.json"
};
function readJSON(p){return JSON.parse(fs.readFileSync(p,"utf8"));}
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
function table(p){
  const rows=parseCSV(fs.readFileSync(p,"utf8"));
  const h=rows[0]||[];
  return rows.slice(1).filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(h.map((x,i)=>[x,r[i]??""])));
}
const canon=readJSON(P.canon);
const schema=readJSON(P.schema);
const assets=table(P.assets);
const layout=readJSON(P.layout);
const builds=readJSON(P.builds).nodes||[];
const errors=[];
const chars=canon.characters||[];
const assetById=new Map(assets.map(x=>[x.asset_id,x]));
const buildById=new Map(builds.map(x=>[x.build_id,x]));
if(schema.title!=="V4 Character Canon Registry")errors.push("character_canon schema title/version contract stale");
if(chars.length<24)errors.push(`characters=${chars.length}, expected >=24`);
const ids=new Set();
for(const c of chars){
  if(ids.has(c.id))errors.push(`duplicate character id ${c.id}`);
  ids.add(c.id);
  for(const k of ["id","name","role","species","tier","ratio","height","sceneScale","evidenceKind"]){
    if(c[k]===undefined||c[k]===null||c[k]==="")errors.push(`${c.id}: missing ${k}`);
  }
  if(!Array.isArray(c.palette)||c.palette.length<3)errors.push(`${c.id}: palette <3`);
  if(!Array.isArray(c.traits)||!c.traits.length)errors.push(`${c.id}: missing invariant traits`);
  if(!Array.isArray(c.forbid)||!c.forbid.length)errors.push(`${c.id}: missing forbidden changes`);
  if(!Array.isArray(c.expressions)||c.expressions.length<4)errors.push(`${c.id}: expressions <4`);
  if(!Array.isArray(c.animations)||c.animations.length<2)errors.push(`${c.id}: animations <2`);
  const views=new Set(c.canonViews||[]);
  for(const v of ["Front","ThreeQuarter","Side","Back","Expressions"])if(!views.has(v))errors.push(`${c.id}: canon view missing ${v}`);
  const expected=[`${c.id}_canon_sheet`,`${c.id}_avatar`,`${c.id}_story`,`${c.id}_spine`];
  if(JSON.stringify(c.assetIds)!==JSON.stringify(expected))errors.push(`${c.id}: assetIds mismatch`);
  for(const id of expected){
    const a=assetById.get(id);
    if(!a)errors.push(`${c.id}: missing asset ${id}`);
    else if(a.status!=="APPROVED")errors.push(`${c.id}: asset ${id} status=${a.status}`);
  }
  const sheet=assetById.get(`${c.id}_canon_sheet`);
  if(sheet){
    for(const v of ["Front","ThreeQuarter","Side","Back","Expressions"])if(!(sheet.states||"").split("|").includes(v))errors.push(`${c.id}: CanonSheet missing state ${v}`);
  }
}
const areas=layout.areas||[];
const nodes=areas.flatMap(a=>a.nodes||[]);
if(areas.length!==4)errors.push(`areas=${areas.length}, expected 4`);
if(nodes.length!==48)errors.push(`layout nodes=${nodes.length}, expected 48`);
if(builds.length!==48)errors.push(`build nodes=${builds.length}, expected 48`);
for(const area of areas){
  if(!area.camera||!Number.isFinite(area.camera.minX)||!Number.isFinite(area.camera.maxX)||!Number.isFinite(area.camera.minY)||!Number.isFinite(area.camera.maxY))errors.push(`${area.areaId}: invalid camera bounds`);
}
for(const n of nodes){
  for(const k of ["position","anchor","footprint","hitArea"])if(!n[k])errors.push(`${n.buildId}: missing ${k}`);
  if(!Array.isArray(n.npcSockets)||!n.npcSockets.length)errors.push(`${n.buildId}: missing npcSockets`);
  if(n.parallaxLayer==null||n.foregroundOccluder==null)errors.push(`${n.buildId}: missing occlusion/layer fields`);
  const b=buildById.get(n.buildId);
  if(!b){errors.push(`${n.buildId}: missing build registry row`);continue;}
  const before=assetById.get(b.asset_before),after=assetById.get(b.asset_after);
  if(!before||!after){errors.push(`${n.buildId}: missing before/after assets`);continue;}
  if(before.status!=="APPROVED"||after.status!=="APPROVED")errors.push(`${n.buildId}: before/after not APPROVED`);
  if(before.pivot!==after.pivot||before.anchor!==after.anchor)errors.push(`${n.buildId}: before/after pivot or anchor mismatch`);
}
const result={
  characters:chars.length,
  approvedCharacterAssets:chars.length*4,
  areas:areas.length,
  layoutNodes:nodes.length,
  buildNodes:builds.length,
  errors
};
console.log(JSON.stringify(result,null,2));
process.exit(errors.length?1:0);
