#!/usr/bin/env node
import {execFileSync} from "node:child_process";

const config=process.argv[2]||"production-data/v4/runtime/game_content_day001_110.json";
const runs=Number(process.argv[3]||100);
const seed=Number(process.argv[4]||20260925);

const out=execFileSync(process.execPath,[
  "tools/balance-simulator/simulate.mjs",
  config,"all",String(runs),String(seed)
],{encoding:"utf8",maxBuffer:64*1024*1024});
const data=JSON.parse(out);
const errors=[];
if((data.days||[]).length!==110)errors.push(`day count ${data.days?.length} != 110`);
for(const d of data.days||[]){
  if(d.runsRequested!==runs)errors.push(`Day ${d.day}: runsRequested ${d.runsRequested} != ${runs}`);
  if(d.runsResolved!==runs)errors.push(`Day ${d.day}: runsResolved ${d.runsResolved} != ${runs}`);
  if(d.unresolvedRuns!==0)errors.push(`Day ${d.day}: unresolvedRuns ${d.unresolvedRuns}`);
  if((d.unresolvedItems||[]).length)errors.push(`Day ${d.day}: unresolvedItems ${d.unresolvedItems.join(",")}`);
  if(!d.energy||!d.waitSec||!d.peakCells||!d.manualActions)errors.push(`Day ${d.day}: missing stats`);
}
const peak={
  energyP90:Math.max(...(data.days||[]).map(d=>d.energy?.p90??0)),
  waitP90:Math.max(...(data.days||[]).map(d=>d.waitSec?.p90??0)),
  peakCellsP90:Math.max(...(data.days||[]).map(d=>d.peakCells?.p90??0)),
  manualActionsP90:Math.max(...(data.days||[]).map(d=>d.manualActions?.p90??0))
};
console.log(JSON.stringify({
  config,runs,seed,
  dayCount:data.days?.length||0,
  resolvedDays:(data.days||[]).filter(d=>d.runsResolved===runs&&d.unresolvedRuns===0&&(d.unresolvedItems||[]).length===0).length,
  peak,
  errors,
  result:errors.length?"FAIL":"PASS"
},null,2));
process.exit(errors.length?1:0);
