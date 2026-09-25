import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const P = (...xs) => path.join(ROOT, ...xs);

const files = {
  assets: P('production-data/v4/art/assets_master.csv'),
  queue: P('production-data/v4/art/art_production_queue_v4.csv'),
  anchors: P('production-data/v4/art/style_anchor_manifest_v4.csv'),
  anchorJobs: P('production-data/v4/art/ai_art_jobs_v4.json'),
  batchJobs: P('production-data/v4/art/ai_art_batch_s1_s3_v4.json'),
  outputs: P('production-data/v4/art/art_output_manifest_v4.json')
};

function fail(msg) {
  console.error('ERROR', msg);
  errors.push(msg);
}
function warn(msg) {
  console.warn('WARN ', msg);
  warnings.push(msg);
}
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { fail(`Invalid JSON ${path.relative(ROOT,file)}: ${e.message}`); return null; }
}
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
  if (!rows.length) return [];
  const header=rows[0];
  return rows.slice(1).filter(r=>r.some(v=>v!=='')).map((r,ri)=>{
    if (r.length !== header.length) fail(`CSV width mismatch row ${ri+2}: expected ${header.length}, got ${r.length}`);
    return Object.fromEntries(header.map((h,i)=>[h,r[i]??'']));
  });
}
function readCsv(file) {
  try { return parseCsv(fs.readFileSync(file,'utf8')); }
  catch (e) { fail(`Unreadable CSV ${path.relative(ROOT,file)}: ${e.message}`); return []; }
}
function dupes(values) {
  const seen=new Set(), d=new Set();
  for (const v of values) { if (seen.has(v)) d.add(v); seen.add(v); }
  return [...d];
}

const errors=[];
const warnings=[];

for (const [k,f] of Object.entries(files)) {
  if (!fs.existsSync(f)) fail(`Missing required art contract file: ${path.relative(ROOT,f)}`);
}

const assets = fs.existsSync(files.assets) ? readCsv(files.assets) : [];
const queue = fs.existsSync(files.queue) ? readCsv(files.queue) : [];
const anchors = fs.existsSync(files.anchors) ? readCsv(files.anchors) : [];
const anchorJobs = fs.existsSync(files.anchorJobs) ? readJson(files.anchorJobs) : null;
const batchJobs = fs.existsSync(files.batchJobs) ? readJson(files.batchJobs) : null;
const outputs = fs.existsSync(files.outputs) ? readJson(files.outputs) : null;

const assetIds = assets.map(x=>x.asset_id);
const anchorIds = anchors.map(x=>x.anchor_id);
const queueAssetIds = queue.map(x=>x.asset_id);
const allowedQueueStatuses = new Set([
  'PLANNED','READY_FOR_CONCEPT','CONCEPT_REVIEW','CANON_LOCKED','GENERATED','CLEANUP','QA','APPROVED','INTEGRATED'
]);

for (const d of dupes(assetIds)) fail(`Duplicate asset_id: ${d}`);
for (const d of dupes(anchorIds)) fail(`Duplicate anchor_id: ${d}`);
for (const d of dupes(queueAssetIds)) fail(`Duplicate queue asset_id: ${d}`);

const assetSet=new Set(assetIds);
const anchorSet=new Set(anchorIds);
for (const row of queue) {
  if (!assetSet.has(row.asset_id)) fail(`Queue references missing asset_id: ${row.asset_id}`);
  if (row.depends_on && !anchorSet.has(row.depends_on)) fail(`Queue ${row.asset_id} depends on missing anchor ${row.depends_on}`);
  if (!allowedQueueStatuses.has(row.status)) fail(`Queue ${row.asset_id} has invalid status ${row.status}`);
}
for (const a of anchors) {
  if (!allowedQueueStatuses.has(a.status)) fail(`Anchor ${a.anchor_id} has invalid status ${a.status}`);
}

const allJobs=[
  ...((anchorJobs && Array.isArray(anchorJobs.jobs)) ? anchorJobs.jobs : []),
  ...((batchJobs && Array.isArray(batchJobs.jobs)) ? batchJobs.jobs : [])
];
const jobIds=allJobs.map(j=>j.job_id);
for (const d of dupes(jobIds)) fail(`Duplicate job_id across job manifests: ${d}`);

for (const j of allJobs) {
  const t=j.asset_id || j.target;
  if (!t) fail(`Job ${j.job_id} has no target/asset_id`);
  else if (!assetSet.has(t) && !anchorSet.has(t)) fail(`Job ${j.job_id} references unknown target ${t}`);
  if (j.anchor_id && !anchorSet.has(j.anchor_id)) fail(`Job ${j.job_id} references missing anchor ${j.anchor_id}`);
  if (!j.prompt_spec || j.prompt_spec.length < 40) fail(`Job ${j.job_id} prompt_spec too short or missing`);
  const forbidden=j.forbidden || [];
  if (Array.isArray(forbidden) && forbidden.some(x=>/pixel-for-pixel|competitor-specific/i.test(String(x))) {
    // Explicit negative constraints are allowed and expected.
  }
}

if (batchJobs) {
  if (batchJobs.jobCount !== batchJobs.jobs?.length) fail(`batchJobs.jobCount mismatch: declared ${batchJobs.jobCount}, actual ${batchJobs.jobs?.length ?? 0}`);
  const batchAssetSet=new Set((batchJobs.jobs||[]).map(x=>x.asset_id));
  for (const q of queue) if (!batchAssetSet.has(q.asset_id)) fail(`Production queue asset has no generated execution job: ${q.asset_id}`);
}

const outputRows = outputs?.outputs || [];
const outputAssetIds=outputRows.map(x=>x.asset_id);
for (const d of dupes(outputAssetIds)) fail(`Duplicate art output asset_id: ${d}`);
const batchJobSet=new Set((batchJobs?.jobs||[]).map(x=>x.job_id));
for (const o of outputRows) {
  if (!assetSet.has(o.asset_id)) fail(`Output references missing asset_id: ${o.asset_id}`);
  if (!batchJobSet.has(o.job_id)) fail(`Output ${o.asset_id} references unknown batch job_id ${o.job_id}`);
  if (!/^art-source\/v4\/exports\//.test(o.file_path||'')) fail(`Output ${o.asset_id} file_path outside art-source/v4/exports`);
  if (!Number.isInteger(o.width) || o.width < 1 || !Number.isInteger(o.height) || o.height < 1) fail(`Output ${o.asset_id} invalid dimensions`);
  if (!/^[a-f0-9]{64}$/.test(o.sha256||'')) fail(`Output ${o.asset_id} invalid sha256`);
  const gates=o.gates||{};
  if (['APPROVED','INTEGRATED'].includes(o.status)) {
    for (const g of ['canon','readability','perspective','palette','bundle','performance','originality']) {
      if (gates[g] !== true) fail(`Output ${o.asset_id} is ${o.status} but gate ${g} is not true`);
    }
  }
}

if (!outputRows.length) warn('No binary art outputs registered yet; contracts and jobs are ready but final rendered assets are still pending.');

const report={
  assets:assetIds.length,
  anchors:anchorIds.length,
  queue:queue.length,
  anchorJobs:anchorJobs?.jobs?.length||0,
  productionJobs:batchJobs?.jobs?.length||0,
  outputs:outputRows.length,
  approved:outputRows.filter(x=>x.status==='APPROVED').length,
  integrated:outputRows.filter(x=>x.status==='INTEGRATED').length,
  warnings,
  errors
};
console.log(JSON.stringify(report,null,2));
process.exit(errors.length ? 1 : 0);
