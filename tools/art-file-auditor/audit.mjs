import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const outputFile=path.join(ROOT,'production-data/v4/art/art_output_manifest_v4.json');
const batchFile=path.join(ROOT,'production-data/v4/art/ai_art_batch_s1_s3_v4.json');

const errors=[];
const warnings=[];
const fail=m=>{errors.push(m);console.error('ERROR',m);};
const warn=m=>{warnings.push(m);console.warn('WARN ',m);};

function sha256(buf){return crypto.createHash('sha256').update(buf).digest('hex');}
function pngInfo(buf){
  const sig=Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  if(buf.length<26 || !buf.subarray(0,8).equals(sig)) return null;
  const width=buf.readUInt32BE(16);
  const height=buf.readUInt32BE(20);
  const bitDepth=buf[24];
  const colorType=buf[25];
  const hasAlpha=colorType===4 || colorType===6 || buf.includes(Buffer.from('tRNS'));
  return {width,height,bitDepth,colorType,hasAlpha};
}

if(!fs.existsSync(outputFile) || !fs.existsSync(batchFile)){
  console.error('Missing art manifests');
  process.exit(1);
}
const outputs=JSON.parse(fs.readFileSync(outputFile,'utf8'));
const batch=JSON.parse(fs.readFileSync(batchFile,'utf8'));
const jobByAsset=new Map((batch.jobs||[]).map(j=>[j.asset_id,j]));
const exportRoot=path.resolve(ROOT,'art-source/v4/exports');

for(const o of outputs.outputs||[]){
  const job=jobByAsset.get(o.asset_id);
  if(!job){fail(`No production job for output ${o.asset_id}`);continue;}
  const abs=path.resolve(ROOT,o.file_path||'');
  if(!(abs===exportRoot || abs.startsWith(exportRoot+path.sep))){
    fail(`${o.asset_id}: file outside art-source/v4/exports`);
    continue;
  }
  if(path.basename(abs)!==path.basename(job.output_contract?.filename||'')){
    fail(`${o.asset_id}: filename does not match job output contract`);
  }
  if(!fs.existsSync(abs)){
    fail(`${o.asset_id}: output file missing at ${o.file_path}`);
    continue;
  }
  const st=fs.statSync(abs);
  if(!st.isFile()){fail(`${o.asset_id}: output path is not a file`);continue;}
  const buf=fs.readFileSync(abs);
  const actualHash=sha256(buf);
  if(actualHash!==o.sha256) fail(`${o.asset_id}: sha256 mismatch`);

  if(o.format==='PNG'){
    const info=pngInfo(buf);
    if(!info){fail(`${o.asset_id}: invalid PNG header`);continue;}
    const minBytes = (info.width * info.height <= 65536) ? 128 : 512;
    if(st.size < minBytes) fail(`${o.asset_id}: suspiciously small file (${st.size} bytes; min ${minBytes})`);
    if(info.width!==o.width || info.height!==o.height){
      fail(`${o.asset_id}: PNG dimensions ${info.width}x${info.height} != manifest ${o.width}x${o.height}`);
    }
    if(job.transparent===true && !info.hasAlpha){
      fail(`${o.asset_id}: job requires transparency but PNG has no alpha/tRNS`);
    }
  } else {
    warn(`${o.asset_id}: binary dimension/alpha parser not implemented for format ${o.format}; hash and existence still checked`);
  }
}

if(!(outputs.outputs||[]).length) warn('No rendered files registered; binary audit is idle.');

console.log(JSON.stringify({
  registered:(outputs.outputs||[]).length,
  errors,
  warnings,
  result:errors.length?'FAIL':'PASS'
},null,2));
process.exit(errors.length?1:0);
