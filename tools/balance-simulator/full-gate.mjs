#!/usr/bin/env node
import fs from "node:fs";
import {execFileSync} from "node:child_process";

const targetFile=process.argv[2]||"production-data/v4/runtime/full_runtime_balance_targets.json";
const spec=JSON.parse(fs.readFileSync(targetFile,"utf8"));
const reports=[],failures=[];

for(const t of spec.targets||[]){
  const out=execFileSync(process.execPath,[
    "tools/balance-simulator/simulate.mjs",
    spec.configPath,
    String(t.day),
    String(spec.runs||500),
    String(spec.seed||20260925)
  ],{encoding:"utf8"});
  const data=JSON.parse(out);
  const d=data.days?.[0];
  if(!d){failures.push(`Day ${t.day}: no result`);continue;}
  const row={
    day:t.day,
    unresolvedItems:d.unresolvedItems||[],
    energyP90:d.energy?.p90??null,
    waitSecP90:d.waitSec?.p90??null,
    peakCellsP90:d.peakCells?.p90??null,
    manualActionsP90:d.manualActions?.p90??null
  };
  reports.push(row);
  if(row.unresolvedItems.length)failures.push(`Day ${t.day}: unresolved ${row.unresolvedItems.join(",")}`);
  if(row.energyP90>t.maxEnergyP90)failures.push(`Day ${t.day}: energy P90 ${row.energyP90} > ${t.maxEnergyP90}`);
  if(row.waitSecP90>t.maxWaitSecP90)failures.push(`Day ${t.day}: wait P90 ${row.waitSecP90} > ${t.maxWaitSecP90}`);
  if(row.peakCellsP90>t.maxPeakCellsP90)failures.push(`Day ${t.day}: peakCells P90 ${row.peakCellsP90} > ${t.maxPeakCellsP90}`);
  if(row.manualActionsP90>t.maxManualActionsP90)failures.push(`Day ${t.day}: manualActions P90 ${row.manualActionsP90} > ${t.maxManualActionsP90}`);
}
console.log(JSON.stringify({targetFile,reports,failures,result:failures.length?"FAIL":"PASS"},null,2));
process.exit(failures.length?1:0);
