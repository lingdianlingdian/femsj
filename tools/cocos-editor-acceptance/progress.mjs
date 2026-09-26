#!/usr/bin/env node
import fs from 'node:fs';
import { inspectJsonEvidence, inspectPngEvidence } from './evidence-lib.mjs';

const acceptancePath='production-data/v4/ui/cocos_editor_acceptance_v4.json';
const atlasPath='production-data/v4/art/cocos_atlas_bundle_plan_v4.json';
const a=JSON.parse(fs.readFileSync(acceptancePath,'utf8'));
const atlas=JSON.parse(fs.readFileSync(atlasPath,'utf8'));

function readBatchSize(){
  const inline=process.argv.find(x=>x.startsWith('--batch-size='));
  if(inline){
    const value=Number(inline.slice('--batch-size='.length));
    return Number.isInteger(value)&&value>0?value:8;
  }
  const index=process.argv.indexOf('--batch-size');
  if(index>=0){
    const value=Number(process.argv[index+1]);
    return Number.isInteger(value)&&value>0?value:8;
  }
  return 8;
}

const batchSize=readBatchSize();
const screenReports=(a.screens||[]).map(row=>{
  const screenshot1334=inspectPngEvidence(row.evidence?.resolution750x1334,750,1334);
  const screenshot1624=inspectPngEvidence(row.evidence?.resolution750x1624,750,1624);
  const state=inspectJsonEvidence(row.evidence?.stateRegression,'state');
  return {
    screenId:row.screenId,
    prefab:fs.existsSync(row.prefabPath)?'READY':'PENDING',
    screenshot1334:screenshot1334.result,
    screenshot1624:screenshot1624.result,
    stateRegression:state.result,
  };
});

const deviceReports=Object.fromEntries(Object.entries(a.deviceEvidence||{}).map(([key,file])=>[
  key,
  inspectJsonEvidence(file,'device').result
]));

const requiredAtlasGroups=(atlas.atlasGroups||[]).filter(x=>x.assetCount>0).map(group=>({
  id:group.id,
  logicalBundle:group.logicalBundle,
  assetCount:group.assetCount,
  expectedPac:group.expectedPac,
  status:fs.existsSync(group.expectedPac)?'READY':'PENDING'
}));

const incompleteScreens=screenReports.filter(x=>
  x.prefab!=='READY'||x.screenshot1334!=='PASS'||x.screenshot1624!=='PASS'||x.stateRegression!=='PASS'
);

const report={
  scene:fs.existsSync(a.scene?.expectedPath||'')?'READY':'PENDING',
  counts:{
    prefabsReady:screenReports.filter(x=>x.prefab==='READY').length,
    screenshots1334Pass:screenReports.filter(x=>x.screenshot1334==='PASS').length,
    screenshots1624Pass:screenReports.filter(x=>x.screenshot1624==='PASS').length,
    stateRegressionsPass:screenReports.filter(x=>x.stateRegression==='PASS').length,
    devicePass:Object.values(deviceReports).filter(x=>x==='PASS').length,
    atlasReady:requiredAtlasGroups.filter(x=>x.status==='READY').length,
    requiredAtlasGroups:requiredAtlasGroups.length,
  },
  nextScreenBatch:incompleteScreens.slice(0,batchSize).map(x=>x.screenId),
  pendingAtlasGroups:requiredAtlasGroups.filter(x=>x.status!=='READY'),
  device:deviceReports,
  screenFailures:screenReports.filter(x=>[x.screenshot1334,x.screenshot1624,x.stateRegression].includes('FAIL')),
};

if(process.argv.includes('--json')){
  console.log(JSON.stringify(report,null,2));
}else{
  console.log('Cocos Editor / device acceptance progress');
  console.log(`App.scene: ${report.scene}`);
  console.log(`Prefabs: ${report.counts.prefabsReady}/46`);
  console.log(`Screenshots 750x1334: ${report.counts.screenshots1334Pass}/46`);
  console.log(`Screenshots 750x1624: ${report.counts.screenshots1624Pass}/46`);
  console.log(`State regressions: ${report.counts.stateRegressionsPass}/46`);
  console.log(`Real-device evidence: ${report.counts.devicePass}/5`);
  console.log(`Auto Atlas: ${report.counts.atlasReady}/${report.counts.requiredAtlasGroups}`);
  console.log(`Next screen batch: ${report.nextScreenBatch.length?report.nextScreenBatch.join(', '):'none'}`);
  if(report.pendingAtlasGroups.length){
    console.log('Pending Auto Atlas groups:');
    for(const group of report.pendingAtlasGroups){
      console.log(`  ${group.logicalBundle} (${group.assetCount}) -> ${group.expectedPac}`);
    }
  }
  if(report.screenFailures.length){
    console.log('Screens with FAIL evidence:');
    for(const row of report.screenFailures) console.log(`  ${row.screenId}`);
  }
}
