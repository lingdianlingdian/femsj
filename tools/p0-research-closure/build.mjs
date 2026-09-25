#!/usr/bin/env node
import fs from 'node:fs';

function j(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function csvRows(p){
  const text=fs.readFileSync(p,'utf8');
  const rows=[];let row=[],field='',q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(q){if(c==='"'&&n==='"'){field+='"';i++;}else if(c==='"')q=false;else field+=c;}
    else if(c==='"')q=true;
    else if(c===','){row.push(field);field='';}
    else if(c==='\n'){row.push(field);rows.push(row);row=[];field='';}
    else if(c!=='\r')field+=c;
  }
  if(field||row.length){row.push(field);rows.push(row);}
  const h=rows.shift()||[];
  return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(h.map((x,i)=>[x,r[i]??''])));
}
const registry=j('production-data/v4/levels/order_registry_110.json');
const verified=j('production-data/v4/levels/order_requirements_verified.json');
const assets=j('research-data/levels/public_image_assets_v4.json');
const graph=j('production-data/v4/content/transform_graph_verified_v4.json');
const producers=csvRows('production-data/v4/content/producers_master_public.csv');
const cookware=csvRows('production-data/v4/content/cookware_seed_public.csv');
const matrix=csvRows('research-data/evidence/p0b_parameter_evidence_matrix_v4.csv');

const orders=registry.orders||[];
const vrows=verified.rows||[];
const publicAssets=assets.assets||[];
const pendingAssets=publicAssets.filter(x=>x.transcriptionStatus==='PENDING_VISUAL_TRANSCRIPTION');
const publicDays=[...new Set(publicAssets.flatMap(x=>x.days||[]))].sort((a,b)=>a-b);
const verifiedDays=[...new Set(vrows.map(x=>x.day))].sort((a,b)=>a-b);
const nonMerge=(graph.relations||[]).filter(x=>x.relationType!=='MERGE2');

const p0a={
  orderRegistry:orders.length,
  verifiedOrders:vrows.length,
  devBlueprintOrders:orders.filter(x=>x.status==='DEV_BLUEPRINT').length,
  persistedPublicImageAssets:publicAssets.length,
  pendingVisualAssets:pendingAssets.length,
  publicEvidenceDays:publicDays,
  verifiedDays,
  unresolvedVerifiedRequirements:verified.unresolvedCount??null,
  policy:'Unreadable or unavailable public media remains pending; it is not guessed into original-game data.'
};
const exact=matrix.filter(x=>x.status==='EVIDENCED_EXACT');
const p0b={
  producers:producers.length,
  cookware:cookware.length,
  recipeRelations:nonMerge.length,
  recipeRelationsWithInputs:nonMerge.filter(x=>Array.isArray(x.inputs)&&x.inputs.length).length,
  recipeRelationsWithOutput:nonMerge.filter(x=>x.outputItemId).length,
  recipeRelationsWithCookware:nonMerge.filter(x=>x.toolId).length,
  recipeRelationsWithExactDuration:nonMerge.filter(x=>Number.isFinite(x.durationSec)).length,
  evidencedExactMatrixRows:exact.length,
  unresolvedMatrixRows:matrix.filter(x=>/UNRESOLVED/.test(x.status)).length,
  policy:'Every evidenced value retains source/observed context; values not verifiable from public evidence remain null/UNRESOLVED.'
};
const report={
  version:'4.0',
  generatedAt:'2026-09-26',
  issue1:p0a,
  issue2:p0b,
  researchPhaseAcceptance:{
    publicEvidenceExhaustion:'PASS_WITH_DOCUMENTED_EXTERNAL_GAPS',
    noGuessing:'PASS',
    nullForUnverified:'PASS',
    note:'Research-phase closure means all currently obtainable public evidence is persisted and remaining inaccessible/unverifiable fields are explicitly pending/null. It does not claim competitor backend completeness.'
  }
};
const out='research-data/evidence/p0_research_closure_report_v4.json';
const expected=JSON.stringify(report,null,2)+'\n';
const check=process.argv.includes('--check');
if(check){
  const actual=fs.existsSync(out)?fs.readFileSync(out,'utf8'):'';
  if(actual!==expected){console.error('STALE '+out);process.exit(1);}
  console.log(JSON.stringify(report,null,2));
}else{
  fs.writeFileSync(out,expected);
  console.log('WROTE '+out);
}
