#!/usr/bin/env node
import fs from 'node:fs';
import { inspectJsonEvidence, inspectPngEvidence } from './evidence-lib.mjs';

const file='production-data/v4/ui/cocos_editor_acceptance_v4.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));

function screenshotResult(path, width, height){
  return inspectPngEvidence(path, width, height).result;
}

function jsonEvidenceResult(path, kind){
  return inspectJsonEvidence(path, kind).result;
}

data.scene.status=fs.existsSync(data.scene.expectedPath)?'READY':'PENDING_EDITOR_GENERATION';

for(const row of data.screens||[]){
  row.editorStatus=fs.existsSync(row.prefabPath)?'READY':'PENDING_EDITOR_GENERATION';
  row.resolution750x1334=screenshotResult(row.evidence?.resolution750x1334,750,1334);
  row.resolution750x1624=screenshotResult(row.evidence?.resolution750x1624,750,1624);
  row.stateRegression=jsonEvidenceResult(row.evidence?.stateRegression,'state');
}

for(const key of Object.keys(data.deviceAcceptance||{})){
  const path=data.deviceEvidence?.[key];
  const result=jsonEvidenceResult(path,'device');
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
