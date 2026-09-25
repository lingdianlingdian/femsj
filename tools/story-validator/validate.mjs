#!/usr/bin/env node
import fs from "node:fs";

const storyFile=process.argv[2]||"production-data/v4/story/story_dialogue_day001_010.json";
const localeFile=process.argv[3]||"production-data/v4/story/locale_zh-CN_day001_010.json";
const runtimeFile=process.argv[4]||"production-data/v4/runtime/game_content_day001_010.json";

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const story=read(storyFile);
const locale=read(localeFile);
const runtime=read(runtimeFile);
const canon=read("production-data/v4/characters/character_canon_v4.json");
const builds=read("production-data/v4/build/build_nodes_4areas.json");

const errors=[],warnings=[];
const chars=new Set((canon.characters||[]).map(x=>x.id));
const sceneIds=new Set(), textKeys=new Set();
const sceneById=new Map();

for(const scene of story.scenes||[]){
  if(!scene.id){errors.push("scene without id");continue;}
  if(sceneIds.has(scene.id))errors.push(`duplicate scene id ${scene.id}`);
  sceneIds.add(scene.id); sceneById.set(scene.id,scene);

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

const runtimeRefs=new Set();
for(const d of runtime.days||[]){
  for(const id of [d.storyBefore,d.storyAfter].filter(Boolean)){
    runtimeRefs.add(id);
    const scene=sceneById.get(id);
    if(!scene)errors.push(`runtime day ${d.day}: missing story scene ${id}`);
    else if(scene.day!==d.day)errors.push(`runtime day ${d.day}: story ${id} belongs to day ${scene.day}`);
  }
}
for(let day=1;day<=10;day++){
  for(const suffix of ["entry","exit"]){
    const id=`story_day_${String(day).padStart(3,"0")}_${suffix}`;
    if(!runtimeRefs.has(id))errors.push(`Day ${day}: runtime missing ${suffix} ref ${id}`);
  }
}

const buildMap=new Map((builds.nodes||[]).map(x=>[x.build_id,x]));
for(const b of (builds.nodes||[]).filter(x=>x.unlock_day<=10)){
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

const dayScenes=(story.scenes||[]).filter(x=>x.day>=1&&x.day<=10);
const result={
  storyFile,localeFile,runtimeFile,
  counts:{
    scenes:(story.scenes||[]).length,
    lines:textKeys.size,
    charactersReferenced:new Set((story.scenes||[]).flatMap(s=>(s.lines||[]).map(l=>l.speakerId))).size,
    runtimeStoryRefs:runtimeRefs.size,
    buildStoryRefs:(builds.nodes||[]).filter(x=>x.unlock_day<=10).length,
    day1To10Scenes:dayScenes.length
  },
  errors,warnings,
  result:errors.length?"FAIL":"PASS"
};
console.log(JSON.stringify(result,null,2));
process.exit(errors.length?1:0);
