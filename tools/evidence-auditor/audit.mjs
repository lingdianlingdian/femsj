#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const roots=["production-data","research-data","docs"];
const ephemeral=/\bturn\d+(?:image|view|search|fetch|file|news|product|business|reddit|youtube)\d+\b/gi;
const findings=[];
function walk(p){
  if(!fs.existsSync(p)) return;
  const st=fs.statSync(p);
  if(st.isDirectory()){
    for(const n of fs.readdirSync(p)) walk(path.join(p,n));
    return;
  }
  if(!/\.(json|csv|md|txt)$/i.test(p)) return;
  const txt=fs.readFileSync(p,"utf8");
  let m;
  while((m=ephemeral.exec(txt))){
    const line=txt.slice(0,m.index).split(/\r?\n/).length;
    findings.push({file:p,line,token:m[0]});
  }
}
roots.forEach(walk);
console.log(JSON.stringify({ephemeralReferenceCount:findings.length,findings,result:findings.length?"FAIL":"PASS"},null,2));
process.exit(findings.length?1:0);
