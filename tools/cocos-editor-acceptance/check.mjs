#!/usr/bin/env node
import fs from 'node:fs';
import { inspectJsonEvidence, inspectPngEvidence } from './evidence-lib.mjs';

const acceptancePath='production-data/v4/ui/cocos_editor_acceptance_v4.json';
const extensionPkgPath='client-cocos/extensions/femsj-editor-bootstrap/package.json';
const extensionMain='client-cocos/extensions/femsj-editor-bootstrap/dist/main.js';
const extensionScene='client-cocos/extensions/femsj-editor-bootstrap/dist/scene.js';

const a=JSON.parse(fs.readFileSync(acceptancePath,'utf8'));
const p=JSON.parse(fs.readFileSync(extensionPkgPath,'utf8'));
const errors=[];

if(p.package_version!==2) errors.push('extension package_version must be 2');
if(!String(p.editor||'').includes('3.8')) errors.push('extension editor range must target 3.8');
if(p.contributions?.scene?.script!=='./dist/scene.js') errors.push('scene contribution missing');
if(!Array.isArray(p.contributions?.menu)||p.contributions.menu.length<2) errors.push('editor menu contributions missing');
if(!p.contributions?.messages?.['generate-app-shell']) errors.push('generate-app-shell message missing');
if(!p.contributions?.messages?.['audit-app-shell']) errors.push('audit-app-shell message missing');
for(const f of [extensionMain,extensionScene]) if(!fs.existsSync(f)||!fs.readFileSync(f,'utf8').trim()) errors.push('missing extension file '+f);

if(a.engine!=='Cocos Creator 3.8 LTS') errors.push('acceptance engine mismatch');
if(!Array.isArray(a.screens)||a.screens.length!==46) errors.push('acceptance screens != 46');
const ids=(a.screens||[]).map(x=>x.screenId);
if(new Set(ids).size!==46) errors.push('duplicate acceptance screenId');

const allowedScreenEvidence=new Set(['PENDING','PASS','FAIL']);
for(let i=0;i<46;i++){
  const id='UI'+String(i).padStart(2,'0');
  const row=a.screens?.find(x=>x.screenId===id);
  if(!row){errors.push('missing '+id);continue;}

  const prefabExists=fs.existsSync(row.prefabPath);
  if(row.editorStatus==='READY'&&!prefabExists) errors.push(id+' READY but prefab missing');
  if(prefabExists&&row.editorStatus!=='READY') errors.push(id+' prefab exists but editorStatus='+row.editorStatus);

  const screenshots=[
    ['resolution750x1334',750,1334],
    ['resolution750x1624',750,1624]
  ];
  for(const [field,width,height] of screenshots){
    if(!allowedScreenEvidence.has(row[field])) errors.push(id+' invalid '+field+' status='+row[field]);
    const report=inspectPngEvidence(row.evidence?.[field],width,height);
    if(report.exists&&!report.valid) errors.push(id+' '+field+' invalid evidence: '+report.errors.join('; '));
    if(row[field]!==report.result) errors.push(id+' '+field+' status='+row[field]+' but evidence='+report.result);
  }

  if(!allowedScreenEvidence.has(row.stateRegression)) errors.push(id+' invalid stateRegression status='+row.stateRegression);
  const stateReport=inspectJsonEvidence(row.evidence?.stateRegression,'state');
  if(stateReport.exists&&!stateReport.valid) errors.push(id+' invalid state regression evidence: '+stateReport.errors.join('; '));
  if(row.stateRegression!==stateReport.result) errors.push(id+' stateRegression='+row.stateRegression+' but evidence='+stateReport.result);
}

const sceneExists=fs.existsSync(a.scene?.expectedPath||'');
if(a.scene?.status==='READY'&&!sceneExists) errors.push('App scene READY but file missing');
if(sceneExists&&a.scene?.status!=='READY') errors.push('App scene exists but status='+a.scene?.status);

const allowedDevice=new Set(['PENDING_REAL_DEVICE','PASS','FAIL']);
for(const [k,v] of Object.entries(a.deviceAcceptance||{})){
  if(!allowedDevice.has(v)) errors.push('invalid device acceptance '+k+'='+v);
  const report=inspectJsonEvidence(a.deviceEvidence?.[k],'device');
  const expected=report.result==='PENDING'?'PENDING_REAL_DEVICE':report.result;
  if(report.exists&&!report.valid) errors.push(k+' invalid device evidence: '+report.errors.join('; '));
  if(v!==expected) errors.push(k+' status='+v+' but evidence='+expected);
}

console.log(JSON.stringify({
  extension:p.name,
  expectedScreens:46,
  readyScreenPrefabs:(a.screens||[]).filter(x=>x.editorStatus==='READY').length,
  screenshots1334:(a.screens||[]).filter(x=>x.resolution750x1334==='PASS').length,
  screenshots1624:(a.screens||[]).filter(x=>x.resolution750x1624==='PASS').length,
  stateRegressions:(a.screens||[]).filter(x=>x.stateRegression==='PASS').length,
  appSceneStatus:a.scene?.status,
  deviceAcceptance:a.deviceAcceptance,
  errors
},null,2));
process.exit(errors.length?1:0);
