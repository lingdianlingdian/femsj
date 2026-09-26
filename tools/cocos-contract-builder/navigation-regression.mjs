#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gatePath = new URL('../../client-cocos/assets/scripts/core/LatestNavigationGate.ts', import.meta.url);
const source = fs.readFileSync(gatePath, 'utf8');
const jsSource = source
  .replace(/private sequence = 0;/, 'sequence = 0;')
  .replace(/begin\(\): number/g, 'begin()')
  .replace(/isCurrent\(token: number\): boolean/g, 'isCurrent(token)')
  .replace(/invalidate\(\): void/g, 'invalidate()');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(jsSource).toString('base64')}`;
const { LatestNavigationGate } = await import(moduleUrl);

const gate = new LatestNavigationGate();
const first = gate.begin();
assert.equal(gate.isCurrent(first), true);

const second = gate.begin();
assert.equal(gate.isCurrent(first), false, 'older navigation must be superseded');
assert.equal(gate.isCurrent(second), true);

gate.invalidate();
assert.equal(gate.isCurrent(second), false, 'clear/invalidate must supersede pending navigation');

console.log(JSON.stringify({
  status: 'PASS',
  cases: ['latest request wins', 'older request superseded', 'clear invalidates pending request']
}, null, 2));
