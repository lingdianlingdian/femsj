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
  const header=rows[0]||[];
  return {header,rows:rows.slice(1).filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]??''])))};
}
function csvEscape(v){return '"' + String(v??'').replaceAll('"','""') + '"';}
function writeCsv(file,header,rows){fs.writeFileSync(file,[header.join(','),...rows.map(r=>header.map(h=>csvEscape(r[h]??'')).join(','))].join('\n')+'\n','utf8');}


const ROOT=process.cwd();
const anchorId=process.argv[2];
if(!anchorId){console.error('Usage: npm run art:anchor:lock -- <anchor_id>');process.exit(2);}
const P=(...xs)=>path.join(ROOT,...xs);
const qaFile=P('art-source/v4/qa/anchors',anchorId+'.json');
const outputsFile=P('production-data/v4/art/style_anchor_outputs_v4.json');
const anchorsFile=P('production-data/v4/art/style_anchor_manifest_v4.csv');
if(!fs.existsSync(qaFile)){console.error('Missing anchor QA file');process.exit(1);}
const qa=JSON.parse(fs.readFileSync(qaFile,'utf8'));
const failedHard=Object.entries(qa.hardGates||{}).filter(([,v])=>v!==true).map(([k])=>k);
const failedAcceptance=(qa.acceptance||[]).filter(x=>x.pass!==true).map(x=>x.criterion);
if(failedHard.length||failedAcceptance.length){
  console.error('Anchor QA not passed:',JSON.stringify({failedHard,failedAcceptance},null,2));process.exit(1);
}
if(qa.decision!=='APPROVE'){console.error('Anchor QA decision must be APPROVE');process.exit(1);}
if(!String(qa.reviewer||'').trim()){console.error('Anchor QA reviewer required');process.exit(1);}

const outputs=JSON.parse(fs.readFileSync(outputsFile,'utf8'));
const out=(outputs.outputs||[]).find(o=>o.anchor_id===anchorId);
if(!out){console.error('Anchor output not ingested');process.exit(1);}
out.status='CANON_LOCKED';
out.reviewer=qa.reviewer;
out.reviewedAt=qa.reviewedAt||new Date().toISOString();
out.qa_file='art-source/v4/qa/anchors/'+anchorId+'.json';
outputs.updatedAt=new Date().toISOString();
fs.writeFileSync(outputsFile,JSON.stringify(outputs,null,2)+'\n','utf8');

const parsed=parseCsv(fs.readFileSync(anchorsFile,'utf8'));
const a=parsed.rows.find(x=>x.anchor_id===anchorId);
if(!a){console.error('Anchor missing from manifest');process.exit(1);}
a.status='CANON_LOCKED';
writeCsv(anchorsFile,parsed.header,parsed.rows);
console.log(JSON.stringify({anchor_id:anchorId,status:'CANON_LOCKED',reviewer:out.reviewer},null,2));
