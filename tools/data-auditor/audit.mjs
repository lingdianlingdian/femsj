#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const roots=["production-data","research-data","templates"];
const issues=[], stats=[];
function parseCSV(text){
 const rows=[]; let row=[],field="",q=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i],n=text[i+1];
  if(q){
   if(ch==='"'&&n==='"'){field+='"';i++;}
   else if(ch==='"')q=false;
   else field+=ch;
  } else {
   if(ch==='"')q=true;
   else if(ch===','){row.push(field);field="";}
   else if(ch==='\n'){row.push(field);rows.push(row);row=[];field="";}
   else if(ch!=='\r')field+=ch;
  }
 }
 if(field.length||row.length){row.push(field);rows.push(row);}
 return rows;
}
function walk(p){
 if(!fs.existsSync(p))return;
 const st=fs.statSync(p);
 if(st.isDirectory()){for(const n of fs.readdirSync(p))walk(path.join(p,n));return;}
 if(!p.endsWith(".csv"))return;
 const rows=parseCSV(fs.readFileSync(p,"utf8"));
 const width=rows[0]?.length||0;
 let bad=0;
 for(let i=1;i<rows.length;i++){
  if(rows[i].length!==width){bad++;issues.push({file:p,line:i+1,expected:width,actual:rows[i].length});}
 }
 stats.push({file:p,columns:width,dataRows:Math.max(0,rows.length-1),badRows:bad});
}
roots.forEach(walk);
console.log(JSON.stringify({files:stats.length,stats,issues,result:issues.length?"FAIL":"PASS"},null,2));
process.exit(issues.length?1:0);
