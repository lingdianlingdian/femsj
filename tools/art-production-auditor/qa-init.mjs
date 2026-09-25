import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const assetId=process.argv[2];
if(!assetId){console.error('Usage: npm run art:qa:init -- <asset_id>');process.exit(2);}
const jobs=JSON.parse(fs.readFileSync(path.join(ROOT,'production-data/v4/art/ai_art_batch_s1_s3_v4.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'production-data/v4/art/art_output_manifest_v4.json'),'utf8'));
const job=(jobs.jobs||[]).find(j=>j.asset_id===assetId);
const out=(manifest.outputs||[]).find(o=>o.asset_id===assetId);
if(!job){console.error('Unknown asset job');process.exit(1);}
if(!out){console.error('Asset has not been ingested yet');process.exit(1);}

const required=['canon','readability','perspective','palette','bundle','performance','originality'];
const extra=[];
if(['BoardItem','Dish'].includes(job.category)) extra.push('readability64','silhouette','family_consistency');
if(job.category==='Producer') extra.push('state_readability','silhouette_distinct_from_item_and_cookware');
if(job.category==='Cookware') extra.push('state_readability','silhouette_distinct_from_producer');
if(job.category==='UI') extra.push('nine_slice_safe','state_readability','no_baked_copy');
if(String(job.category||'').startsWith('Character')) extra.push('canon_identity','fixed_props','proportion_consistency');
if(job.category==='CharacterAvatar') extra.push('avatar_64px_identity');
if(job.category==='CharacterStory') extra.push('expression_consistency','crop_consistency');
if(job.category==='CharacterNPC') extra.push('rig_friendly_layers','motion_silhouette');
if(job.category==='Building') extra.push('paired_pivot','paired_footprint','bounds_drift_lte_8pct','layerability','no_readable_signage');
if(job.category==='VFX') extra.push('low_end_fallback','critical_ui_clear');

const checklist={
  version:'4.0',
  asset_id:assetId,
  job_id:job.job_id,
  category:job.category,
  file_path:out.file_path,
  createdAt:new Date().toISOString(),
  reviewer:'',
  reviewedAt:'',
  decision:'PENDING',
  gates:Object.fromEntries([...required,...extra].map(k=>[k,false])),
  notes:[]
};
const dir=path.join(ROOT,'art-source/v4/qa');
fs.mkdirSync(dir,{recursive:true});
const file=path.join(dir,assetId+'.json');
if(fs.existsSync(file)){console.error('QA checklist already exists:',path.relative(ROOT,file));process.exit(1);}
fs.writeFileSync(file,JSON.stringify(checklist,null,2)+'\n','utf8');
console.log(path.relative(ROOT,file));
