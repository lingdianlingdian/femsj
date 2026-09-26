#!/usr/bin/env node
import fs from 'node:fs';

const CHECK=process.argv.includes('--check');
const plan=JSON.parse(fs.readFileSync('production-data/v4/art/cocos_atlas_bundle_plan_v4.json','utf8'));
const outputs=JSON.parse(fs.readFileSync('production-data/v4/art/art_output_manifest_v4.json','utf8'));
const byId=new Map((outputs.outputs||[]).map(x=>[x.asset_id,x]));

const assets=(plan.assets||[]).map(x=>{
  const src=byId.get(x.assetId);
  if(!src) throw new Error(`Missing art output for ${x.assetId}`);
  if(src.status!=='APPROVED') throw new Error(`Art output not APPROVED: ${x.assetId}`);
  return {
    assetId:x.assetId,
    sourcePath:src.file_path,
    targetFile:`client-cocos/assets/resources/${x.resourcePath}.png`,
    resourcePath:x.resourcePath,
    sha256:src.sha256,
    width:src.width,
    height:src.height,
    logicalBundle:x.logicalBundle,
    atlasPolicy:x.atlasPolicy,
    status:'BINARY_STAGED_EDITOR_META_PENDING'
  };
});

const map={
  version:'4.0',
  generatedAt:'2026-09-26',
  policy:'Derived from cocos_atlas_bundle_plan_v4 + approved art_output_manifest_v4.',
  count:assets.length,
  assets
};
if(map.count!==389) throw new Error(`asset map count=${map.count}`);
const out='client-cocos/assets/resources/generated/asset_import_map_v4.json';
const expected=JSON.stringify(map,null,2)+'\n';
if(CHECK){
  const actual=fs.existsSync(out)?fs.readFileSync(out,'utf8'):'';
  if(actual!==expected){console.error('STALE '+out);process.exit(1);}
  console.log(JSON.stringify({result:'PASS',count:map.count},null,2));
}else{
  fs.writeFileSync(out,expected);
  console.log(JSON.stringify({result:'WROTE',count:map.count},null,2));
}
