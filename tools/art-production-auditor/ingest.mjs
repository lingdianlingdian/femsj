import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const assetId=process.argv[2];
const inputArg=process.argv[3];
if(!assetId || !inputArg){
  console.error('Usage: npm run art:ingest -- <asset_id> <repo-relative-file-path>');
  process.exit(2);
}

const P=(...xs)=>path.join(ROOT,...xs);
const queueFile=P('production-data/v4/art/art_production_queue_v4.csv');
const assetsFile=P('production-data/v4/art/assets_master.csv');
const jobsFile=P('production-data/v4/art/ai_art_batch_s1_s3_v4.json');
const outputFile=P('production-data/v4/art/art_output_manifest_v4.json');
const allowedRoot=path.resolve(P('art-source/v4/exports'));
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
  if (!rows.length) return {header:[],rows:[]};
  const header=rows[0];
  return {
    header,
    rows:rows.slice(1).filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]??''])))
  };
}
function csvEscape(v) {
  const s=String(v??'');
  return '"' + s.replaceAll('"','""') + '"';
}
function writeCsv(file, header, rows) {
  const out=[header.join(',')];
  for (const r of rows) out.push(header.map(h=>csvEscape(r[h]??'')).join(','));
  fs.writeFileSync(file,out.join('\n')+'\n','utf8');
}


function sha256(buf){return crypto.createHash('sha256').update(buf).digest('hex');}
function pngInfo(buf){
  const sig=Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  if(buf.length<26 || !buf.subarray(0,8).equals(sig)) return null;
  return {
    width:buf.readUInt32BE(16),
    height:buf.readUInt32BE(20),
    bitDepth:buf[24],
    colorType:buf[25],
    hasAlpha:buf[25]===4 || buf[25]===6 || buf.includes(Buffer.from('tRNS'))
  };
}

const rel=inputArg.replaceAll('\\','/');
const abs=path.resolve(ROOT,rel);
if(!(abs===allowedRoot || abs.startsWith(allowedRoot+path.sep))){
  console.error('Input must be under art-source/v4/exports/');
  process.exit(1);
}
if(!fs.existsSync(abs) || !fs.statSync(abs).isFile()){
  console.error('File does not exist:',rel);
  process.exit(1);
}

const jobs=JSON.parse(fs.readFileSync(jobsFile,'utf8'));
const job=(jobs.jobs||[]).find(j=>j.asset_id===assetId);
if(!job){
  console.error('No production job for asset_id:',assetId);
  process.exit(1);
}
const expectedName=job.output_contract?.filename;
if(expectedName && path.basename(abs)!==expectedName){
  console.error(`Filename mismatch: expected ${expectedName}, got ${path.basename(abs)}`);
  process.exit(1);
}

const buf=fs.readFileSync(abs);
const ext=path.extname(abs).toLowerCase();
let width=0,height=0,format='';
if(ext==='.png'){
  const info=pngInfo(buf);
  if(!info){console.error('Invalid PNG');process.exit(1);}
  width=info.width; height=info.height; format='PNG';
  if(job.transparent===true && !info.hasAlpha){
    console.error('Job requires transparent PNG but alpha/tRNS is absent');
    process.exit(1);
  }
} else {
  console.error('Ingest currently accepts PNG production exports only.');
  process.exit(1);
}

const expected=String(job.source_size||'').match(/^(\d+)x(\d+)$/);
if(expected && (width!==Number(expected[1]) || height!==Number(expected[2]))){
  console.error(`Dimension mismatch: expected ${job.source_size}, got ${width}x${height}`);
  process.exit(1);
}

const manifest=JSON.parse(fs.readFileSync(outputFile,'utf8'));
const row={
  asset_id:assetId,
  job_id:job.job_id,
  file_path:rel,
  width,
  height,
  format,
  sha256:sha256(buf),
  status:'GENERATED',
  generatedAt:new Date().toISOString(),
  qa_file:`art-source/v4/qa/${assetId}.json`,
  gates:{
    canon:false,
    readability:false,
    perspective:false,
    palette:false,
    bundle:false,
    performance:false,
    originality:false
  }
};
const outputs=manifest.outputs||[];
const idx=outputs.findIndex(x=>x.asset_id===assetId);
if(idx>=0){
  if(['APPROVED','INTEGRATED'].includes(outputs[idx].status)){
    console.error('Refusing to overwrite approved/integrated output:',assetId);
    process.exit(1);
  }
  outputs[idx]=row;
}else outputs.push(row);
manifest.outputs=outputs;
manifest.updatedAt=new Date().toISOString();
fs.writeFileSync(outputFile,JSON.stringify(manifest,null,2)+'\n','utf8');

for (const file of [queueFile,assetsFile]){
  const parsed=parseCsv(fs.readFileSync(file,'utf8'));
  const target=parsed.rows.find(x=>x.asset_id===assetId);
  if(!target){console.error('Missing asset row in',path.relative(ROOT,file));process.exit(1);}
  target.status='GENERATED';
  writeCsv(file,parsed.header,parsed.rows);
}

console.log(JSON.stringify({asset_id:assetId,file_path:rel,width,height,sha256:row.sha256,status:'GENERATED',qa_file:row.qa_file},null,2));
