#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CHECK = process.argv.includes('--check');
const srcScreens = path.join(ROOT, 'production-data/v4/ui/screens_v4.json');
const srcComponents = path.join(ROOT, 'production-data/v4/ui/components_v4.json');
const out = path.join(ROOT, 'client-cocos/assets/resources/generated/screen_prefab_map_v4.json');

const screens = JSON.parse(fs.readFileSync(srcScreens, 'utf8'));
const components = JSON.parse(fs.readFileSync(srcComponents, 'utf8'));

const manifest = {
  version: '4.0',
  generatedAt: '2026-09-26',
  engine: 'Cocos Creator 3.8 LTS',
  architecture: 'persistent App.scene + screen Prefabs loaded from resources',
  shellScene: 'App',
  designResolution: { width: 750, height: 1334 },
  tallResolution: { width: 750, height: 1624 },
  screens: (screens.screens || []).map((s) => ({
    screenId: s.id,
    name: s.name,
    route: s.route,
    prefabResourcePath: `ui/screens/${s.id}`,
    sourceContract: 'production-data/v4/ui/screens_v4.json',
    states: s.states || [],
    componentTypes: (s.components || []).map((x) => x.type),
    components: s.components || [],
    layout: s.layout || {},
    interactionRules: s.interactionRules || [],
    network: s.network || null,
    analytics: s.analytics || [],
    acceptance: s.acceptance || [],
    status: 'PENDING_EDITOR_GENERATION'
  })),
  sharedComponents: (components.components || []).map((c) => ({
    componentId: c.id,
    name: c.name,
    sourcePrefab: c.prefab,
    resourcePath: String(c.prefab || '').replace(/\.prefab$/, ''),
    category: c.category,
    states: c.states || [],
    minTouch: c.minTouch ?? null,
    status: 'PENDING_EDITOR_GENERATION'
  }))
};

const errors = [];
if (manifest.screens.length !== 46) errors.push(`screens=${manifest.screens.length}, expected 46`);
if (manifest.sharedComponents.length !== 41) errors.push(`components=${manifest.sharedComponents.length}, expected 41`);
if (new Set(manifest.screens.map(x => x.screenId)).size !== 46) errors.push('duplicate screenId');
if (new Set(manifest.screens.map(x => x.route)).size !== 46) errors.push('duplicate route');
for (const s of manifest.screens) {
  if (!/^UI\d{2}$/.test(s.screenId)) errors.push(`invalid screenId ${s.screenId}`);
  if (!s.route || !s.prefabResourcePath) errors.push(`${s.screenId}: missing route/prefab path`);
  if (!s.states.length) errors.push(`${s.screenId}: missing states`);
  if (!s.interactionRules.length) errors.push(`${s.screenId}: missing interaction rules`);
  if (!s.acceptance.length) errors.push(`${s.screenId}: missing acceptance rules`);
  if (!s.network || !Number.isFinite(s.network.timeoutMs)) errors.push(`${s.screenId}: invalid network contract`);
}
for (const c of manifest.sharedComponents) {
  if (!c.componentId || !c.sourcePrefab || !c.resourcePath) errors.push(`${c.componentId || 'UNKNOWN'}: incomplete prefab contract`);
}

if (errors.length) {
  console.error(JSON.stringify({ result: 'FAIL', errors }, null, 2));
  process.exit(1);
}
const expected = JSON.stringify(manifest, null, 2) + '\n';
if (CHECK) {
  const actual = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (actual !== expected) {
    console.error('STALE client-cocos/assets/resources/generated/screen_prefab_map_v4.json');
    process.exit(1);
  }
  console.log(JSON.stringify({ result: 'PASS', screens: 46, sharedComponents: 41 }, null, 2));
  process.exit(0);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, expected);
console.log(JSON.stringify({ written: path.relative(ROOT, out), screens: 46, sharedComponents: 41 }, null, 2));
