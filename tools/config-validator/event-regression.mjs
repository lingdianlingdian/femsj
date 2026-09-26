#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const validator = path.join(root, 'tools/config-validator/validate.mjs');
const sourcePath = path.join(root, 'production-data/v4/runtime/game_content_day001_110.json');
const base = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectInvalid(id, mutate, expectedText) {
  const config = clone(base);
  mutate(config);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'femsj-event-regression-'));
  const file = path.join(dir, id + '.json');
  fs.writeFileSync(file, JSON.stringify(config));
  const result = spawnSync(process.execPath, [validator, file], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });

  assert.notEqual(result.status, 0, id + ' should fail config validation');
  const output = (result.stdout || '') + '\n' + (result.stderr || '');
  assert.match(output, expectedText, id + ' should report the expected invariant');
}

const eventWithMilestones = base.events.find(e => (e.milestones || []).length >= 2);
const race = base.events.find(e => e.type === 'RACE');
const pass = base.events.find(e => e.type === 'PASS');
const album = base.events.find(e => e.type === 'ALBUM');

assert.ok(eventWithMilestones, 'Need an event with at least two milestones');
assert.ok(race, 'Need a RACE event');
assert.ok(pass, 'Need a PASS event');
assert.ok(album, 'Need an ALBUM event');

expectInvalid('TC_EVENT_001', config => {
  const e = config.events.find(x => x.id === eventWithMilestones.id);
  e.milestones[0].reward = e.milestones[0].rewards?.[0] ?? { type: 'COIN', amount: 1 };
  delete e.milestones[0].rewards;
}, /has no rewards/);

expectInvalid('TC_EVENT_002', config => {
  const e = config.events.find(x => x.id === eventWithMilestones.id);
  e.milestones[1].threshold = e.milestones[0].threshold;
}, /strictly ascending/);

expectInvalid('TC_EVENT_003', config => {
  const e = config.events.find(x => x.id === race.id);
  delete e.matchmaking;
}, /RACE requires matchmaking/);

expectInvalid('TC_EVENT_004', config => {
  const e = config.events.find(x => x.id === pass.id);
  e.levels = 0;
}, /PASS requires positive levels/);

expectInvalid('TC_EVENT_005', config => {
  const e = config.events.find(x => x.id === album.id);
  e.guarantee = { ...(e.guarantee || {}), enabled: true, pityPoints: 0 };
}, /enabled guarantee requires pityPoints >0/);

expectInvalid('TC_EVENT_007', config => {
  const e = config.events[0];
  e.durationHours = 1;
  e.durationDays = 1;
}, /multiple duration units configured/);

console.log(JSON.stringify({
  status: 'PASS',
  cases: [
    'TC_EVENT_001',
    'TC_EVENT_002',
    'TC_EVENT_003',
    'TC_EVENT_004',
    'TC_EVENT_005',
    'TC_EVENT_007'
  ]
}, null, 2));
