#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const dir="production-data/v4/story";
const files=fs.readdirSync(dir).filter(x=>/^story_dialogue_day\d{3}_\d{3}\.json$/.test(x)).sort();
const reports=[],failures=[];

for(const file of files){
  const m=file.match(/^story_dialogue_day(\d{3})_(\d{3})\.json$/);
  const minDay=Number(m[1]),maxDay=Number(m[2]);
  const locale=`locale_zh-CN_day${m[1]}_${m[2]}.json`;
  const storyPath=path.join(dir,file);
  const localePath=path.join(dir,locale);
  if(!fs.existsSync(localePath)){
    failures.push(`${file}: missing locale ${locale}`);
    continue;
  }
  const runtimePath=minDay===1&&maxDay===10&&fs.existsSync("production-data/v4/runtime/game_content_day001_010.json")
    ?"production-data/v4/runtime/game_content_day001_010.json"
    :"-";
  const r=spawnSync(process.execPath,[
    "tools/story-validator/validate.mjs",
    storyPath,localePath,runtimePath,String(minDay),String(maxDay)
  ],{encoding:"utf8"});
  let parsed=null;
  try{parsed=JSON.parse(r.stdout);}catch{}
  reports.push({
    file,locale,minDay,maxDay,
    exitCode:r.status,
    result:parsed?.result||"UNKNOWN",
    counts:parsed?.counts||null,
    errors:parsed?.errors||[],
    warnings:parsed?.warnings||[],
    stderr:r.stderr?.trim()||""
  });
  if(r.status!==0)failures.push(`${file}: validation failed`);
}

console.log(JSON.stringify({
  files:files.length,
  reports,
  failures,
  result:failures.length?"FAIL":"PASS"
},null,2));
process.exit(failures.length?1:0);
