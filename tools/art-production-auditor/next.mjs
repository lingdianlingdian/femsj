import fs from 'node:fs';

function parseCsv(text) {
  const rows=[]; let row=[], field='', quoted=false;
  for (let i=0;i<text.length;i++) {
    const c=text[i];
    if (quoted) {
      if (c === '"' && text[i+1] === '"') { field+='"'; i++; }
      else if (c === '"') quoted=false;
      else field+=c;
    } else {
      if (c === '"') quoted=true;
      else if (c === ',') { row.push(field); field=''; }
      else if (c === '\n') { row.push(field.replace(/\r$/,'')); rows.push(row); row=[]; field=''; }
      else field+=c;
    }
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/,'')); rows.push(row); }
  const header=rows[0]||[];
  return rows.slice(1).filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]??''])));
}

const anchors=parseCsv(fs.readFileSync('production-data/v4/art/style_anchor_manifest_v4.csv','utf8'));
const anchorJobs=JSON.parse(fs.readFileSync('production-data/v4/art/ai_art_jobs_v4.json','utf8'));
const waves=JSON.parse(fs.readFileSync('production-data/v4/art/render_waves_day001_010_v4.json','utf8'));
const jobs=JSON.parse(fs.readFileSync('production-data/v4/art/ai_art_batch_s1_s3_v4.json','utf8'));
const outputs=JSON.parse(fs.readFileSync('production-data/v4/art/art_output_manifest_v4.json','utf8'));

let limit=Number(process.argv[2]||10);
if(!Number.isFinite(limit)||limit<1) limit=10;

const anchorStatus=new Map(anchors.map(a=>[a.anchor_id,a.status]));
const anchorJobByTarget=new Map((anchorJobs.jobs||[]).map(j=>[j.target,j]));
const unlocked=anchors.filter(a=>a.status!=='CANON_LOCKED');

if(unlocked.length){
  const nextAnchors=[];
  for(const a of unlocked){
    const job=anchorJobByTarget.get(a.anchor_id);
    nextAnchors.push(job ? {
      anchor_id:a.anchor_id,
      status:a.status,
      job_id:job.job_id,
      kind:job.kind,
      size:job.size,
      transparent:job.transparent,
      prompt_spec:job.prompt_spec,
      output_contract:job.output_contract,
      acceptance:job.acceptance,
      forbidden:job.forbidden
    } : {anchor_id:a.anchor_id,status:a.status,error:'NO_ANCHOR_JOB'});
    if(nextAnchors.length>=limit) break;
  }
  console.log(JSON.stringify({
    phase:'W0_STYLE_LOCK',
    blockedProduction:true,
    locked:anchors.length-unlocked.length,
    totalAnchors:anchors.length,
    remainingAnchors:unlocked.length,
    next:nextAnchors
  },null,2));
  process.exit(nextAnchors.some(x=>x.error)?1:0);
}

const jobByAsset=new Map((jobs.jobs||[]).map(j=>[j.asset_id,j]));
const done=new Set((outputs.outputs||[]).filter(o=>['APPROVED','INTEGRATED'].includes(o.status)).map(o=>o.asset_id));
const pending=[];
for(const wave of waves.waves||[]){
  for(const asset_id of wave.asset_ids||[]){
    if(done.has(asset_id)) continue;
    const job=jobByAsset.get(asset_id);
    if(!job){pending.push({wave:wave.id,asset_id,error:'NO_JOB'});continue;}
    if(anchorStatus.get(job.anchor_id)!=='CANON_LOCKED'){
      pending.push({wave:wave.id,asset_id,error:'ANCHOR_NOT_LOCKED',anchor_id:job.anchor_id});
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
  phase:'W1_W4_PRODUCTION',
  blockedProduction:false,
  approvedOrIntegrated:done.size,
  remaining:(waves.waves||[]).reduce((n,w)=>n+(w.asset_ids||[]).filter(id=>!done.has(id)).length,0),
  next:pending
},null,2));
process.exit(pending.some(x=>x.error)?1:0);
