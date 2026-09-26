#!/usr/bin/env node
import fs from 'node:fs';

const CHECK=process.argv.includes('--check');
const assetsFile='production-data/v4/art/assets_master.csv';
const outputFile='production-data/v4/art/cocos_atlas_bundle_plan_v4.json';

function parseCSV(text){
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

const rows=parseCSV(fs.readFileSync(assetsFile,'utf8'));
const spriteFormats=new Set(['PNG/WebP','PNG 9-slice','PNG/SVG','PNG']);
const assets=rows.map(x=>{
  const atlasCandidate=spriteFormats.has(x.format);
  return {
    assetId:x.asset_id,
    category:x.category,
    subcategory:x.subcategory,
    logicalBundle:x.bundle,
    physicalBundle:'resources',
    resourcePath:`art/${x.asset_id}`,
    sourceFormat:x.format,
    atlasPolicy:atlasCandidate?'SPRITE_ATLAS_CANDIDATE':'STANDALONE',
    targetAtlas:atlasCandidate?`atlas_${x.bundle}`:null,
    status:'PLANNED_EDITOR_IMPORT'
  };
});

const logicalBundles=[...new Set(assets.map(x=>x.logicalBundle))].sort();
const atlasGroups=logicalBundles.map(bundle=>{
  const members=assets.filter(x=>x.logicalBundle===bundle&&x.atlasPolicy==='SPRITE_ATLAS_CANDIDATE');
  return {
    id:`atlas_${bundle}`,
    logicalBundle:bundle,
    physicalBundle:'resources',
    assetCount:members.length,
    assetIds:members.map(x=>x.assetId),
    status:members.length?'PENDING_EDITOR_ATLAS_GENERATION':'NOT_REQUIRED'
  };
});

const report={
  version:'4.0',
  generatedAt:'2026-09-26',
  engine:'Cocos Creator 3.8 LTS',
  strategy:{
    currentPhysicalBundle:'resources',
    logicalBundleSource:'production-data/v4/art/assets_master.csv#bundle',
    rule:'Static sprite formats are atlas candidates; Spine/particle/PSD-intent assets remain standalone.',
    migration:'Logical bundle IDs are stable and can become physical Asset Bundles later without changing AssetId.'
  },
  counts:{
    assets:assets.length,
    logicalBundles:logicalBundles.length,
    atlasCandidates:assets.filter(x=>x.atlasPolicy==='SPRITE_ATLAS_CANDIDATE').length,
    standalone:assets.filter(x=>x.atlasPolicy==='STANDALONE').length
  },
  logicalBundles:logicalBundles.map(bundle=>({
    id:bundle,
    assetCount:assets.filter(x=>x.logicalBundle===bundle).length
  })),
  atlasGroups,
  assets
};
if(report.counts.assets!==389) throw new Error(`assets=${report.counts.assets}, expected 389`);
const expected=JSON.stringify(report,null,2)+'\n';
if(CHECK){
  const actual=fs.existsSync(outputFile)?fs.readFileSync(outputFile,'utf8'):'';
  if(actual!==expected){console.error('STALE '+outputFile);process.exit(1);}
  console.log(JSON.stringify(report.counts,null,2));
}else{
  fs.writeFileSync(outputFile,expected);
  console.log(JSON.stringify(report.counts,null,2));
}
