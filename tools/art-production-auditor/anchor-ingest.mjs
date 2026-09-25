import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
  return {header,rows:rows.slice(1).filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]??''])))};
}
function csvEscape(v){return '"' + String(v??'').replaceAll('"','""') + '"';}
function writeCsv(file,header,rows){fs.writeFileSync(file,[header.join(','),...rows.map(r=>header.map(h=>csvEscape(r[h]??'')).join(','))].join('\n')+'\n','utf8');}


const ROOT=process.cwd();
const anchorId=process.argv[2];
const inputArg=process.argv[3];
if(!anchorId || !inputArg){console.error('Usage: npm run art:anchor:ingest -- <anchor_id> <repo-relative-png>');process.exit(2);}
const P=(...xs)=>path.join(ROOT,...xs);
const jobsFile=P('production-data/v4/art/ai_art_jobs_v4.json');
const anchorsFile=P('production-data/v4/art/style_anchor_manifest_v4.csv');
const outputsFile=P('production-data/v4/art/style_anchor_outputs_v4.json');
const allowedRoot=path.resolve(P('art-source/v4/anchors'));

function sha256(buf){return crypto.createHash('sha256').update(buf).digest('hex');}
function pngInfo(buf){
  const sig=Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  if(buf.length<26 || !buf.subarray(0,8).equals(sig)) return null;
  return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20),colorType:buf[25],hasAlpha:buf[25]===4||buf[25]===6||buf.includes(Buffer.from('tRNS'))};
}

const jobs=JSON.parse(fs.readFileSync(jobsFile,'utf8'));
const job=(jobs.jobs||[]).find(j=>j.target===anchorId);
if(!job){console.error('No anchor job for',anchorId);process.exit(1);}
const rel=inputArg.replaceAll('\\','/');
const abs=path.resolve(ROOT,rel);
if(!(abs===allowedRoot || abs.startsWith(allowedRoot+path.sep))){console.error('Anchor file must be under art-source/v4/anchors/');process.exit(1);}
if(!fs.existsSync(abs)||!fs.statSync(abs).isFile()){console.error('File missing:',rel);process.exit(1);}
if(path.basename(abs)!==job.output_contract?.filename){console.error('Filename mismatch: expected',job.output_contract?.filename);process.exit(1);}
if(path.extname(abs).toLowerCase()!=='.png'){console.error('Anchor ingest currently accepts PNG only');process.exit(1);}
const buf=fs.readFileSync(abs);
const info=pngInfo(buf);
if(!info){console.error('Invalid PNG');process.exit(1);}
const m=String(job.size||'').match(/^(\d+)x(\d+)$/);
if(m&&(info.width!==Number(m[1])||info.height!==Number(m[2]))){console.error(`Dimension mismatch: expected ${job.size}, got ${info.width}x${info.height}`);process.exit(1);}
if(job.transparent===true&&!info.hasAlpha){console.error('Anchor job requires transparency but PNG has no alpha/tRNS');process.exit(1);}

const outputs=JSON.parse(fs.readFileSync(outputsFile,'utf8'));
const row={anchor_id:anchorId,job_id:job.job_id,file_path:rel,width:info.width,height:info.height,format:'PNG',sha256:sha256(buf),status:'CONCEPT_REVIEW',generatedAt:new Date().toISOString(),qa_file:job.output_contract?.qa_file||`art-source/v4/qa/anchors/${anchorId}.json`};
const idx=(outputs.outputs||[]).findIndex(x=>x.anchor_id===anchorId);
if(idx>=0){
  if(outputs.outputs[idx].status==='CANON_LOCKED'){console.error('Refusing to overwrite CANON_LOCKED anchor');process.exit(1);}
  outputs.outputs[idx]=row;
}else (outputs.outputs||(outputs.outputs=[])).push(row);
outputs.updatedAt=new Date().toISOString();
fs.writeFileSync(outputsFile,JSON.stringify(outputs,null,2)+'\n','utf8');

const parsed=parseCsv(fs.readFileSync(anchorsFile,'utf8'));
const a=parsed.rows.find(x=>x.anchor_id===anchorId);
if(!a){console.error('Anchor missing from manifest');process.exit(1);}
a.status='CONCEPT_REVIEW';
writeCsv(anchorsFile,parsed.header,parsed.rows);
console.log(JSON.stringify(row,null,2));
