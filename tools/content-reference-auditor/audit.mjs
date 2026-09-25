#!/usr/bin/env node
import fs from "node:fs";

function parseCSV(text){
  const rows=[];let row=[],f="",q=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];
    if(q){if(c==='"'&&n==='"'){f+='"';i++;}else if(c==='"')q=false;else f+=c;}
    else{if(c==='"')q=true;else if(c===','){row.push(f);f="";}else if(c==='\n'){row.push(f);rows.push(row);row=[];f="";}else if(c!=='\r')f+=c;}
  }
  if(f.length||row.length){row.push(f);rows.push(row);}return rows;
}
const read=p=>fs.readFileSync(p,"utf8");
const itemRows=parseCSV(read("production-data/v4/content/items_seed_public.csv"));
const h=itemRows[0], ix=Object.fromEntries(h.map((x,i)=>[x,i]));
const items=new Set(itemRows.slice(1).map(r=>r[ix.item_id]).filter(Boolean));
const aliases=JSON.parse(read("production-data/v4/content/content_aliases.json")).aliases||[];
const aliasMap=new Map(aliases.map(x=>[x.alias_id,x.canonical_id]));
const canonical=id=>aliasMap.get(id)||id;
const problems=[], warnings=[];
function need(id,where){
  if(!id)return;
  const c=canonical(id);
  if(!items.has(c))problems.push({where,id,canonical:c,problem:"MISSING_ITEM"});
  if(aliasMap.has(id))warnings.push({where,id,canonical:c,problem:"DEPRECATED_ALIAS_REFERENCE"});
}

const req=JSON.parse(read("production-data/v4/levels/order_requirements_verified.json"));
for(const row of req.rows||[])for(const x of row.requirements||[])need(x.itemId,`order:${row.orderId}`);

const graph=JSON.parse(read("production-data/v4/content/transform_graph_verified_v4.json"));
for(const r of graph.relations||[]){
  for(const x of r.inputs||[])need(x.itemId,`relation:${r.id}:input`);
  need(r.outputItemId,`relation:${r.id}:output`);
}
for(const r of graph.directItems||[]){
  for(const x of r.inputs||[])need(x.itemId,`direct:${r.id}:input`);
  need(r.outputItemId,`direct:${r.id}:output`);
}

const po=parseCSV(read("production-data/v4/content/producer_outputs_public.csv"));
const ph=po[0], pix=Object.fromEntries(ph.map((x,i)=>[x,i]));
for(const r of po.slice(1))need(r[pix.output_item_id],`producer:${r[pix.producer_id]}`);

const byName=new Map();
for(const r of itemRows.slice(1)){
  const name=r[ix.name],id=r[ix.item_id],status=r[ix.evidence_status];
  if(!name||status==="DEPRECATED_ALIAS")continue;
  if(!byName.has(name))byName.set(name,[]);
  byName.get(name).push(id);
}
for(const [name,ids] of byName)if(ids.length>1)warnings.push({problem:"DUPLICATE_ACTIVE_NAME",name,ids});

const result={items:items.size,aliases:aliases.length,errors:problems,warnings,result:problems.length?"FAIL":"PASS"};
console.log(JSON.stringify(result,null,2));
process.exit(problems.length?1:0);
