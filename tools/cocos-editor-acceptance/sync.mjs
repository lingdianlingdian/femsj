#!/usr/bin/env node
import fs from 'node:fs';

const file='production-data/v4/ui/cocos_editor_acceptance_v4.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));

function evidenceResult(path){
  if(!path||!fs.existsSync(path)) return 'PENDING';
  if(path.endsWith('.png')) return 'PASS';
  try{
    const value=JSON.parse(fs.readFileSync(path,'utf8'));
    return value.result==='PASS'?'PASS':value.result==='FAIL'?'FAIL':'PENDING';
  }catch{
    return 'FAIL';
  }
}

data.scene.status=fs.existsSync(data.scene.expectedPath)?'READY':'PENDING_EDITOR_GENERATION';

for(const row of data.screens||[]){
  row.editorStatus=fs.existsSync(row.prefabPath)?'READY':'PENDING_EDITOR_GENERATION';
  row.resolution750x1334=evidenceResult(row.evidence?.resolution750x1334);
  row.resolution750x1624=evidenceResult(row.evidence?.resolution750x1624);
  row.stateRegression=evidenceResult(row.evidence?.stateRegression);
}

for(const key of Object.keys(data.deviceAcceptance||{})){
  const path=data.deviceEvidence?.[key];
  const result=evidenceResult(path);
  data.deviceAcceptance[key]=result==='PENDING'?'PENDING_REAL_DEVICE':result;
}

data.lastSyncedAt='2026-09-26';
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({
  scene:data.scene.status,
  readyPrefabs:data.screens.filter(x=>x.editorStatus==='READY').length,
  screenshots1334:data.screens.filter(x=>x.resolution750x1334==='PASS').length,
  screenshots1624:data.screens.filter(x=>x.resolution750x1624==='PASS').length,
  stateRegressions:data.screens.filter(x=>x.stateRegression==='PASS').length,
  deviceAcceptance:data.deviceAcceptance
},null,2));
