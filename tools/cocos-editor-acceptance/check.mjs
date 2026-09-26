#!/usr/bin/env node
import fs from 'node:fs';

const acceptancePath='production-data/v4/ui/cocos_editor_acceptance_v4.json';
const extensionPkgPath='client-cocos/extensions/femsj-editor-bootstrap/package.json';
const extensionMain='client-cocos/extensions/femsj-editor-bootstrap/dist/main.js';
const extensionScene='client-cocos/extensions/femsj-editor-bootstrap/dist/scene.js';

const a=JSON.parse(fs.readFileSync(acceptancePath,'utf8'));
const p=JSON.parse(fs.readFileSync(extensionPkgPath,'utf8'));
const errors=[];

function jsonResult(path){
  if(!path||!fs.existsSync(path)) return null;
  try{return JSON.parse(fs.readFileSync(path,'utf8')).result??null;}
  catch{return 'INVALID_JSON';}
}

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

for(let i=0;i<46;i++){
  const id='UI'+String(i).padStart(2,'0');
  const row=a.screens?.find(x=>x.screenId===id);
  if(!row){errors.push('missing '+id);continue;}

  const prefabExists=fs.existsSync(row.prefabPath);
  if(row.editorStatus==='READY'&&!prefabExists) errors.push(id+' READY but prefab missing');
  if(prefabExists&&row.editorStatus!=='READY') errors.push(id+' prefab exists but editorStatus='+row.editorStatus);

  for(const field of ['resolution750x1334','resolution750x1624']){
    const path=row.evidence?.[field];
    const exists=!!path&&fs.existsSync(path);
    if(row[field]==='PASS'&&!exists) errors.push(id+' '+field+' PASS but screenshot missing');
    if(exists&&row[field]!=='PASS') errors.push(id+' '+field+' screenshot exists but status='+row[field]);
  }

  const statePath=row.evidence?.stateRegression;
  const stateResult=jsonResult(statePath);
  if(row.stateRegression==='PASS'&&stateResult!=='PASS') errors.push(id+' state regression PASS without PASS evidence');
  if(stateResult==='PASS'&&row.stateRegression!=='PASS') errors.push(id+' state regression evidence PASS but status='+row.stateRegression);
  if(stateResult==='FAIL'&&row.stateRegression!=='FAIL') errors.push(id+' state regression evidence FAIL but status='+row.stateRegression);
}

const sceneExists=fs.existsSync(a.scene?.expectedPath||'');
if(a.scene?.status==='READY'&&!sceneExists) errors.push('App scene READY but file missing');
if(sceneExists&&a.scene?.status!=='READY') errors.push('App scene exists but status='+a.scene?.status);

const allowedDevice=new Set(['PENDING_REAL_DEVICE','PASS','FAIL']);
for(const [k,v] of Object.entries(a.deviceAcceptance||{})){
  if(!allowedDevice.has(v)) errors.push('invalid device acceptance '+k+'='+v);
  const result=jsonResult(a.deviceEvidence?.[k]);
  if(v==='PASS'&&result!=='PASS') errors.push(k+' PASS without PASS evidence');
  if(v==='FAIL'&&result!=='FAIL') errors.push(k+' FAIL without FAIL evidence');
  if(result==='PASS'&&v!=='PASS') errors.push(k+' PASS evidence but status='+v);
  if(result==='FAIL'&&v!=='FAIL') errors.push(k+' FAIL evidence but status='+v);
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
