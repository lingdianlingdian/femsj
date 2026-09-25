#!/usr/bin/env node
import fs from "node:fs";

const storyFile=process.argv[2]||"production-data/v4/story/story_dialogue_day001_010.json";
const localeFile=process.argv[3]||"production-data/v4/story/locale_zh-CN_day001_010.json";
const runtimeArg=process.argv[4]||"production-data/v4/runtime/game_content_day001_010.json";
const minDay=process.argv[5] ? Number(process.argv[5]) : 1;
const maxDay=process.argv[6] ? Number(process.argv[6]) : 10;

if(!Number.isInteger(minDay)||!Number.isInteger(maxDay)||minDay<1||maxDay<minDay){
  console.error("Usage: node tools/story-validator/validate.mjs [story.json] [locale.json] [runtime.json|-] [minDay] [maxDay]");
  process.exit(2);
}

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const story=read(storyFile);
const locale=read(localeFile);
const runtime=runtimeArg==="-"?null:read(runtimeArg);
const canon=read("production-data/v4/characters/character_canon_v4.json");
const builds=read("production-data/v4/build/build_nodes_4areas.json");

function parseCSV(text){
  const rows=[];let row=[],field="",quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(quoted){
      if(c==='"'&&n==='"'){field+='"';i++;}
      else if(c==='"')quoted=false;
      else field+=c;
    }else{
      if(c==='"')quoted=true;
      else if(c===','){row.push(field);field="";}
      else if(c==='\n'){row.push(field);rows.push(row);row=[];field="";}
      else if(c!=='\r')field+=c;
    }
  }
  if(field.length||row.length){row.push(field);rows.push(row);}
  return rows;
}

const beatRows=parseCSV(fs.readFileSync("production-data/v4/story/story_beats_110.csv","utf8"));
const beatHeader=beatRows[0]||[];
const bix=Object.fromEntries(beatHeader.map((x,i)=>[x,i]));
const beats=beatRows.slice(1)
  .filter(r=>r.some(Boolean))
  .map(r=>({
    day:Number(r[bix.day]),
    entryId:r[bix.entry_story_id],
    exitId:r[bix.exit_story_id],
    beatType:r[bix.beat_type],
    status:r[bix.status]
  }))
  .filter(x=>x.day>=minDay&&x.day<=maxDay);

const errors=[],warnings=[];
const chars=new Set((canon.characters||[]).map(x=>x.id));
const sceneIds=new Set(),textKeys=new Set(),sceneById=new Map();

for(const scene of story.scenes||[]){
  if(!scene.id){errors.push("scene without id");continue;}
  if(sceneIds.has(scene.id))errors.push(`duplicate scene id ${scene.id}`);
  sceneIds.add(scene.id);sceneById.set(scene.id,scene);

  if(scene.day<minDay||scene.day>maxDay)warnings.push(`scene ${scene.id}: day ${scene.day} outside requested range ${minDay}-${maxDay}`);
  if(scene.evidenceKind!=="DEV_BLUEPRINT")errors.push(`scene ${scene.id}: evidenceKind must be DEV_BLUEPRINT`);
  if(!(scene.day>=1))errors.push(`scene ${scene.id}: invalid day`);
  if(!["DAY_ENTRY","DAY_EXIT","BUILD"].includes(scene.trigger))errors.push(`scene ${scene.id}: invalid trigger ${scene.trigger}`);
  if(scene.trigger==="BUILD"&&!scene.buildNodeId)errors.push(`scene ${scene.id}: BUILD missing buildNodeId`);
  if(scene.trigger!=="BUILD"&&scene.buildNodeId)warnings.push(`scene ${scene.id}: non-BUILD has buildNodeId`);
  if(!(scene.lines||[]).length)errors.push(`scene ${scene.id}: no lines`);

  for(const line of scene.lines||[]){
    if(!chars.has(line.speakerId))errors.push(`scene ${scene.id}: unknown speaker ${line.speakerId}`);
    if(!line.textKey)errors.push(`scene ${scene.id}: missing textKey`);
    else{
      if(textKeys.has(line.textKey))errors.push(`duplicate textKey ${line.textKey}`);
      textKeys.add(line.textKey);
      if(!(line.textKey in (locale.strings||{})))errors.push(`scene ${scene.id}: locale missing ${line.textKey}`);
      else if(!String(locale.strings[line.textKey]).trim())errors.push(`scene ${scene.id}: blank locale ${line.textKey}`);
    }
  }
}

const beatByDay=new Map(beats.map(x=>[x.day,x]));
for(let day=minDay;day<=maxDay;day++){
  const beat=beatByDay.get(day);
  if(!beat){errors.push(`Day ${day}: missing story beat registry row`);continue;}
  for(const [kind,id,trigger] of [
    ["entry",beat.entryId,"DAY_ENTRY"],
    ["exit",beat.exitId,"DAY_EXIT"]
  ]){
    const scene=sceneById.get(id);
    if(!scene)errors.push(`Day ${day}: missing ${kind} scene ${id}`);
    else{
      if(scene.day!==day)errors.push(`Day ${day}: scene ${id} belongs to day ${scene.day}`);
      if(scene.trigger!==trigger)errors.push(`Day ${day}: scene ${id} trigger ${scene.trigger} != ${trigger}`);
    }
  }
}

const runtimeRefs=new Set();
if(runtime){
  for(const d of runtime.days||[]){
    if(d.day<minDay||d.day>maxDay)continue;
    const beat=beatByDay.get(d.day);
    for(const [field,expected] of [["storyBefore",beat?.entryId],["storyAfter",beat?.exitId]]){
      const id=d[field];
      if(!id){errors.push(`runtime day ${d.day}: missing ${field}`);continue;}
      runtimeRefs.add(id);
      if(expected&&id!==expected)errors.push(`runtime day ${d.day}: ${field} ${id} != beat registry ${expected}`);
      const scene=sceneById.get(id);
      if(!scene)errors.push(`runtime day ${d.day}: missing story scene ${id}`);
      else if(scene.day!==d.day)errors.push(`runtime day ${d.day}: story ${id} belongs to day ${scene.day}`);
    }
  }
  for(let day=minDay;day<=maxDay;day++){
    if(!(runtime.days||[]).some(x=>x.day===day))warnings.push(`runtime has no Day ${day}; beat/scene closure still validated without runtime binding`);
  }
}

const buildMap=new Map((builds.nodes||[]).map(x=>[x.build_id,x]));
const rangeBuilds=(builds.nodes||[]).filter(x=>x.unlock_day>=minDay&&x.unlock_day<=maxDay);
for(const b of rangeBuilds){
  const id=b.story_trigger;
  if(!id)errors.push(`build ${b.build_id}: missing story_trigger`);
  const scene=sceneById.get(id);
  if(!scene)errors.push(`build ${b.build_id}: missing scene ${id}`);
  else{
    if(scene.trigger!=="BUILD")errors.push(`build ${b.build_id}: scene ${id} is not BUILD`);
    if(scene.buildNodeId!==b.build_id)errors.push(`build ${b.build_id}: scene buildNodeId mismatch ${scene.buildNodeId}`);
    if(scene.day!==b.unlock_day)errors.push(`build ${b.build_id}: scene day ${scene.day} != unlock day ${b.unlock_day}`);
  }
}
for(const scene of story.scenes||[]){
  if(scene.trigger==="BUILD"&&!buildMap.has(scene.buildNodeId))errors.push(`scene ${scene.id}: unknown buildNodeId ${scene.buildNodeId}`);
}

const localeKeys=new Set(Object.keys(locale.strings||{}));
for(const key of localeKeys)if(!textKeys.has(key))warnings.push(`unused locale key ${key}`);

const rangeScenes=(story.scenes||[]).filter(x=>x.day>=minDay&&x.day<=maxDay);
const result={
  storyFile,localeFile,runtimeFile:runtimeArg,minDay,maxDay,
  counts:{
    scenes:(story.scenes||[]).length,
    rangeScenes:rangeScenes.length,
    lines:textKeys.size,
    charactersReferenced:new Set((story.scenes||[]).flatMap(s=>(s.lines||[]).map(l=>l.speakerId))).size,
    storyBeats:beats.length,
    runtimeStoryRefs:runtimeRefs.size,
    buildStoryRefs:rangeBuilds.length
  },
  errors,warnings,
  result:errors.length?"FAIL":"PASS"
};
console.log(JSON.stringify(result,null,2));
process.exit(errors.length?1:0);
