import fs from 'node:fs';

const waves=JSON.parse(fs.readFileSync('production-data/v4/art/render_waves_day001_010_v4.json','utf8'));
const jobs=JSON.parse(fs.readFileSync('production-data/v4/art/ai_art_batch_s1_s3_v4.json','utf8'));
const outputs=JSON.parse(fs.readFileSync('production-data/v4/art/art_output_manifest_v4.json','utf8'));
const jobByAsset=new Map((jobs.jobs||[]).map(j=>[j.asset_id,j]));
const done=new Set((outputs.outputs||[]).filter(o=>['APPROVED','INTEGRATED'].includes(o.status)).map(o=>o.asset_id));

let limit=Number(process.argv[2]||10);
if(!Number.isFinite(limit)||limit<1) limit=10;

const pending=[];
for(const wave of waves.waves||[]){
  for(const asset_id of wave.asset_ids||[]){
    if(done.has(asset_id)) continue;
    const job=jobByAsset.get(asset_id);
    if(!job){
      pending.push({wave:wave.id,asset_id,error:'NO_JOB'});
      continue;
    }
    pending.push({
      wave:wave.id,
      asset_id,
      job_id:job.job_id,
      anchor_id:job.anchor_id,
      category:job.category,
      source_size:job.source_size,
      transparent:job.transparent,
      prompt_spec:job.prompt_spec,
      output_contract:job.output_contract,
      acceptance:job.acceptance
    });
    if(pending.length>=limit) break;
  }
  if(pending.length>=limit) break;
}

console.log(JSON.stringify({
  approvedOrIntegrated:done.size,
  remaining:(waves.waves||[]).reduce((n,w)=>n+(w.asset_ids||[]).filter(id=>!done.has(id)).length,0),
  next:pending
},null,2));
