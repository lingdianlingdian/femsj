#!/usr/bin/env node
import fs from "node:fs";
import {execFileSync} from "node:child_process";

const targetFile=process.argv[2]||"production-data/v4/runtime/vertical_slice_board_targets.json";
const spec=JSON.parse(fs.readFileSync(targetFile,"utf8"));
const failures=[],reports=[];

for(const t of spec.targets||[]){
  const out=execFileSync(process.execPath,[
    "tools/balance-simulator-v3/simulate.mjs",
    spec.configPath,
    String(t.day),
    String(spec.runs||500),
    String(spec.seed||20260925),
    spec.strategy||"OPTIMIZED"
  ],{encoding:"utf8"});
  const data=JSON.parse(out);
  const d=data.days?.[0];
  if(!d){failures.push(`Day ${t.day}: no result`);continue;}
  const row={
    day:t.day,
    pFullBoard:d.pFullBoard,
    pHardBlocked:d.pHardBlocked,
    peakBoardP90:d.peakBoardCells?.p90??null,
    peakStorageP90:d.peakStorageCells?.p90??null,
    manualActionsP90:d.manualActions?.p90??null,
    pressureClearsP90:d.pressureClears?.p90??null,
    byproductUtilizationP50:d.byproductUtilization?.p50??null
  };
  reports.push(row);
  if(row.pFullBoard>t.maxPFullBoard) failures.push(`Day ${t.day}: P(full board) ${row.pFullBoard} > ${t.maxPFullBoard}`);
  if(row.pHardBlocked>t.maxPHardBlocked) failures.push(`Day ${t.day}: P(hard blocked) ${row.pHardBlocked} > ${t.maxPHardBlocked}`);
  if(row.peakBoardP90>t.maxPeakBoardP90) failures.push(`Day ${t.day}: board P90 ${row.peakBoardP90} > ${t.maxPeakBoardP90}`);
  if(row.peakStorageP90>t.maxPeakStorageP90) failures.push(`Day ${t.day}: storage P90 ${row.peakStorageP90} > ${t.maxPeakStorageP90}`);
  if(row.manualActionsP90>t.maxManualActionsP90) failures.push(`Day ${t.day}: actions P90 ${row.manualActionsP90} > ${t.maxManualActionsP90}`);
  if(row.pressureClearsP90>t.maxPressureClearsP90) failures.push(`Day ${t.day}: pressure clears P90 ${row.pressureClearsP90} > ${t.maxPressureClearsP90}`);
  if(row.byproductUtilizationP50<t.minByproductUtilizationP50) failures.push(`Day ${t.day}: byproduct utilization P50 ${row.byproductUtilizationP50} < ${t.minByproductUtilizationP50}`);
}

console.log(JSON.stringify({targetFile,reports,failures,result:failures.length?"FAIL":"PASS"},null,2));
process.exit(failures.length?1:0);
