import fs from 'node:fs';
import path from 'node:path';
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


const ROOT=process.cwd();
const assetId=process.argv[2];
if(!assetId){console.error('Usage: npm run art:approve -- <asset_id>');process.exit(2);}
const P=(...xs)=>path.join(ROOT,...xs);
const qaFile=P('art-source/v4/qa',assetId+'.json');
const outputFile=P('production-data/v4/art/art_output_manifest_v4.json');
const queueFile=P('production-data/v4/art/art_production_queue_v4.csv');
const assetsFile=P('production-data/v4/art/assets_master.csv');
if(!fs.existsSync(qaFile)){console.error('Missing QA checklist:',path.relative(ROOT,qaFile));process.exit(1);}
const qa=JSON.parse(fs.readFileSync(qaFile,'utf8'));
const failed=Object.entries(qa.gates||{}).filter(([,v])=>v!==true).map(([k])=>k);
if(failed.length){console.error('QA gates not passed:',failed.join(', '));process.exit(1);}
if(!String(qa.reviewer||'').trim()){console.error('QA reviewer is required');process.exit(1);}
if(qa.decision!=='APPROVE'){console.error('QA decision must be APPROVE');process.exit(1);}

const manifest=JSON.parse(fs.readFileSync(outputFile,'utf8'));
const out=(manifest.outputs||[]).find(o=>o.asset_id===assetId);
if(!out){console.error('Output is not ingested');process.exit(1);}
out.status='APPROVED';
out.reviewedAt=qa.reviewedAt || new Date().toISOString();
out.reviewer=qa.reviewer;
out.qa_file='art-source/v4/qa/'+assetId+'.json';
for(const k of ['canon','readability','perspective','palette','bundle','performance','originality']) out.gates[k]=true;
manifest.updatedAt=new Date().toISOString();
fs.writeFileSync(outputFile,JSON.stringify(manifest,null,2)+'\n','utf8');

for (const file of [queueFile,assetsFile]){
  const parsed=parseCsv(fs.readFileSync(file,'utf8'));
  const target=parsed.rows.find(x=>x.asset_id===assetId);
  if(!target){console.error('Missing asset row in',path.relative(ROOT,file));process.exit(1);}
  target.status='APPROVED';
  writeCsv(file,parsed.header,parsed.rows);
}
console.log(JSON.stringify({asset_id:assetId,status:'APPROVED',reviewer:out.reviewer,qa_file:out.qa_file},null,2));
