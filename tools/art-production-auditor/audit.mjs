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
  outputs: P('production-data/v4/art/art_output_manifest_v4.json'),
  runtime: P('production-data/v4/runtime/game_content_day001_010.json'),
  story: P('production-data/v4/story/story_dialogue_day001_010.json'),
  coverage: P('production-data/v4/art/day001_010_art_coverage_v4.json'),
  bindings: P('production-data/v4/art/runtime_art_bindings_day001_010_v4.json')
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
function collectRefs(obj, keyRe, out = new Set()) {
  if (Array.isArray(obj)) {
    for (const x of obj) collectRefs(x, keyRe, out);
  } else if (obj && typeof obj === 'object') {
    for (const [k,v] of Object.entries(obj)) {
      if (keyRe.test(k) && typeof v === 'string') out.add(v);
      collectRefs(v, keyRe, out);
    }
  }
  return out;
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
const runtime = fs.existsSync(files.runtime) ? readJson(files.runtime) : null;
const story = fs.existsSync(files.story) ? readJson(files.story) : null;
const coverage = fs.existsSync(files.coverage) ? readJson(files.coverage) : null;
const bindings = fs.existsSync(files.bindings) ? readJson(files.bindings) : null;

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
  if (forbidden && !Array.isArray(forbidden)) fail(`Job ${j.job_id} forbidden must be an array`);
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

// Day1-10 playable art closure: runtime content + story characters + first six Street01 build nodes.
if (runtime && story) {
  const runtimeRequired = [
    ...(runtime.items || []).map(x => (String(x.id).startsWith('dish_') ? 'art_dish_' : 'art_item_') + String(x.id).replace(/^(dish_|item_)/,'')),
    ...(runtime.producers || []).map(x => 'art_prod_' + String(x.id).replace(/^prod_/,''))
    ,...(runtime.cookwares || []).map(x => 'art_cook_' + String(x.id).replace(/^cook_/,''))
  ];
  const storyCharacters = [...collectRefs(story, /speaker|character|actor|npc/i)].filter(x => /^char_/.test(x));
  const storyRequired = [];
  for (const cid of storyCharacters) {
    storyRequired.push(cid + '_canon_sheet', cid + '_avatar', cid + '_story', cid + '_spine');
  }
  const buildRequired = [];
  for (let i=1;i<=6;i++) {
    const n=String(i).padStart(2,'0');
    buildRequired.push('street_01_build_' + n + '_before', 'street_01_build_' + n + '_after');
  }
  const required = [...new Set([...runtimeRequired, ...storyRequired, ...buildRequired])];
  const batchAssetSet = new Set((batchJobs?.jobs || []).map(x => x.asset_id));
  for (const id of required) {
    if (!assetSet.has(id)) fail('Day1-10 art closure missing manifest asset: ' + id);
    if (!queueAssetIds.includes(id)) fail('Day1-10 art closure missing production queue asset: ' + id);
    if (!batchAssetSet.has(id)) fail('Day1-10 art closure missing execution job: ' + id);
  }
  if (coverage) {
    const declared = new Set([
      ...(coverage.required?.runtimeContent || []),
      ...(coverage.required?.storyCharacterAssets || []),
      ...(coverage.required?.buildings || [])
    ]);
    for (const id of required) if (!declared.has(id)) fail('Coverage report missing required asset: ' + id);
    if (coverage.counts?.requiredUniqueAssets !== required.length) fail('Coverage requiredUniqueAssets mismatch');
    if (coverage.closure?.manifestClosed !== true || coverage.closure?.queueClosed !== true || coverage.closure?.jobsClosed !== true) {
      fail('Coverage report is not fully closed');
    }
  }
}

// Queue/output status coherence.
const queueByAsset=new Map(queue.map(x=>[x.asset_id,x]));
const assetsByAsset=new Map(assets.map(x=>[x.asset_id,x]));
for (const o of outputRows) {
  const q=queueByAsset.get(o.asset_id);
  const a=assetsByAsset.get(o.asset_id);
  if (!q || !a) continue;
  if (o.status === 'GENERATED' && !['GENERATED','CLEANUP','QA','APPROVED','INTEGRATED'].includes(q.status)) {
    fail(`Output ${o.asset_id} is GENERATED but queue status is ${q.status}`);
  }
  if (o.status === 'APPROVED' && q.status !== 'APPROVED') fail(`Approved output ${o.asset_id} queue status is ${q.status}`);
  if (o.status === 'APPROVED' && a.status !== 'APPROVED') fail(`Approved output ${o.asset_id} asset manifest status is ${a.status}`);
  if (o.status === 'INTEGRATED' && (q.status !== 'INTEGRATED' || a.status !== 'INTEGRATED')) {
    fail(`Integrated output ${o.asset_id} status not synchronized across manifests`);
  }
  if (['APPROVED','INTEGRATED'].includes(o.status)) {
    if (!o.qa_file) fail(`Approved/integrated output ${o.asset_id} has no qa_file`);
    else {
      const qaAbs=path.join(ROOT,o.qa_file);
      if (!fs.existsSync(qaAbs)) fail(`Approved/integrated output ${o.asset_id} QA file missing: ${o.qa_file}`);
      else {
        const qa=readJson(qaAbs);
        if (qa) {
          const failedGates=Object.entries(qa.gates||{}).filter(([,v])=>v!==true).map(([k])=>k);
          if (failedGates.length) fail(`QA file for ${o.asset_id} has failed gates: ${failedGates.join(', ')}`);
          if (qa.decision !== 'APPROVE') fail(`QA file for ${o.asset_id} decision is not APPROVE`);
          if (!String(qa.reviewer||'').trim()) fail(`QA file for ${o.asset_id} has no reviewer`);
        }
      }
    }
  }
}

// Runtime art binding closure.
if (bindings && runtime && story) {
  const allBoundAssetIds=[];
  for (const v of Object.values(bindings.uiShell||{})) allBoundAssetIds.push(v);
  for (const group of Object.values(bindings.content||{})) for (const v of Object.values(group||{})) allBoundAssetIds.push(v);
  for (const c of Object.values(bindings.characters||{})) for (const v of Object.values(c||{})) allBoundAssetIds.push(v);
  for (const b of Object.values(bindings.buildNodes||{})) for (const v of Object.values(b||{})) allBoundAssetIds.push(v);
  for (const v of Object.values(bindings.vfx||{})) allBoundAssetIds.push(v);
  for (const id of allBoundAssetIds) if (!assetSet.has(id)) fail('Runtime art binding references missing AssetId: ' + id);

  const runtimeItemIds=new Set((runtime.items||[]).map(x=>x.id));
  const runtimeProducerIds=new Set((runtime.producers||[]).map(x=>x.id));
  const runtimeCookwareIds=new Set((runtime.cookwares||[]).map(x=>x.id));
  for (const id of runtimeItemIds) if (!bindings.content?.items?.[id]) fail('Runtime item missing art binding: ' + id);
  for (const id of runtimeProducerIds) if (!bindings.content?.producers?.[id]) fail('Runtime producer missing art binding: ' + id);
  for (const id of runtimeCookwareIds) if (!bindings.content?.cookwares?.[id]) fail('Runtime cookware missing art binding: ' + id);

  const storyCharacters=[...collectRefs(story,/speaker|character|actor|npc/i)].filter(x=>/^char_/.test(x));
  for (const cid of storyCharacters) if (!bindings.characters?.[cid]) fail('Story character missing art binding: ' + cid);

  for (const node of runtime.buildNodes||[]) if (!bindings.buildNodes?.[node.id]) fail('Build node missing art binding: ' + node.id);
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
