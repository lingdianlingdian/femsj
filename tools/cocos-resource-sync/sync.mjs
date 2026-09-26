#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const CHECK=process.argv.includes('--check');
const copies=[
  ['production-data/v4/runtime/game_content_day001_110.json','client-cocos/assets/resources/generated/game_content_day001_110.json']
];
for(let n=1;n<=110;n+=10){
  const a=String(n).padStart(3,'0'),b=String(n+9).padStart(3,'0');
  copies.push(
    [`production-data/v4/story/story_dialogue_day${a}_${b}.json`,`client-cocos/assets/resources/story/story_dialogue_day${a}_${b}.json`],
    [`production-data/v4/story/locale_zh-CN_day${a}_${b}.json`,`client-cocos/assets/resources/story/locale_zh-CN_day${a}_${b}.json`]
  );
}
const stale=[];
for(const [src,dst] of copies){
  const content=fs.readFileSync(src,'utf8');
  if(CHECK){
    const actual=fs.existsSync(dst)?fs.readFileSync(dst,'utf8'):'';
    if(actual!==content)stale.push(dst);
  }else{
    fs.mkdirSync(path.dirname(dst),{recursive:true});
    fs.writeFileSync(dst,content);
  }
}
if(stale.length){console.error(JSON.stringify({result:'FAIL',stale},null,2));process.exit(1);}
console.log(JSON.stringify({result:'PASS',files:copies.length,mode:CHECK?'check':'sync'},null,2));
