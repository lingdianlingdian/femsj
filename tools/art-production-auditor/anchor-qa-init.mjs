import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const anchorId=process.argv[2];
if(!anchorId){console.error('Usage: npm run art:anchor:qa:init -- <anchor_id>');process.exit(2);}
const jobs=JSON.parse(fs.readFileSync(path.join(ROOT,'production-data/v4/art/ai_art_jobs_v4.json'),'utf8'));
const outputs=JSON.parse(fs.readFileSync(path.join(ROOT,'production-data/v4/art/style_anchor_outputs_v4.json'),'utf8'));
const job=(jobs.jobs||[]).find(j=>j.target===anchorId);
const out=(outputs.outputs||[]).find(o=>o.anchor_id===anchorId);
if(!job){console.error('Unknown anchor job');process.exit(1);}
if(!out){console.error('Anchor has not been ingested');process.exit(1);}

const checklist={
  version:'4.0',
  anchor_id:anchorId,
  job_id:job.job_id,
  file_path:out.file_path,
  createdAt:new Date().toISOString(),
  reviewer:'',
  reviewedAt:'',
  decision:'PENDING',
  hardGates:{
    originality:false,
    target_scope_only:false,
    no_baked_readable_text:false,
    no_unrequested_subjects:false,
    style_consistency:false
  },
  acceptance:(job.acceptance||[]).map(x=>({criterion:x,pass:false,note:''})),
  notes:[]
};
const dir=path.join(ROOT,'art-source/v4/qa/anchors');
fs.mkdirSync(dir,{recursive:true});
const file=path.join(dir,anchorId+'.json');
if(fs.existsSync(file)){console.error('Anchor QA file already exists:',path.relative(ROOT,file));process.exit(1);}
fs.writeFileSync(file,JSON.stringify(checklist,null,2)+'\n','utf8');
console.log(path.relative(ROOT,file));
