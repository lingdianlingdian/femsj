#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inspectJsonEvidence, inspectPngEvidence } from './evidence-lib.mjs';

function syntheticPng(width, height) {
  const buffer = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write('IHDR', 12, 4, 'ascii');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'femsj-editor-evidence-'));
try {
  const png1334 = path.join(dir, '750x1334.png');
  fs.writeFileSync(png1334, syntheticPng(750, 1334));
  assert.equal(inspectPngEvidence(png1334, 750, 1334).result, 'PASS');
  assert.equal(inspectPngEvidence(png1334, 750, 1624).valid, false);

  const invalidPng = path.join(dir, 'invalid.png');
  fs.writeFileSync(invalidPng, Buffer.from('not-a-png'));
  assert.equal(inspectPngEvidence(invalidPng, 750, 1334).valid, false);

  const statePass = path.join(dir, 'state-pass.json');
  fs.writeFileSync(statePass, JSON.stringify({
    result: 'PASS',
    testedAt: '2026-09-26T12:00:00+08:00',
    states: ['LOADING', 'READY', 'ERROR'],
    notes: 'Editor regression completed against actual UI state transitions.'
  }));
  assert.equal(inspectJsonEvidence(statePass, 'state').result, 'PASS');

  const stateInvalid = path.join(dir, 'state-invalid.json');
  fs.writeFileSync(stateInvalid, JSON.stringify({
    result: 'PASS',
    testedAt: '2026-09-26T12:00:00+08:00',
    states: ['READY']
  }));
  assert.equal(inspectJsonEvidence(stateInvalid, 'state').valid, false);

  const deviceFail = path.join(dir, 'device-fail.json');
  fs.writeFileSync(deviceFail, JSON.stringify({
    result: 'FAIL',
    testedAt: '2026-09-26T12:00:00+08:00',
    device: 'Example Device',
    build: 'example-build',
    notes: 'Actual device test failed and requires correction.'
  }));
  const deviceReport = inspectJsonEvidence(deviceFail, 'device');
  assert.equal(deviceReport.valid, true);
  assert.equal(deviceReport.result, 'FAIL');

  const deviceInvalid = path.join(dir, 'device-invalid.json');
  fs.writeFileSync(deviceInvalid, JSON.stringify({
    result: 'PASS',
    testedAt: '2026-09-26T12:00:00+08:00',
    notes: 'Missing device/build must not be accepted.'
  }));
  assert.equal(inspectJsonEvidence(deviceInvalid, 'device').valid, false);

  console.log(JSON.stringify({
    pngDimensionValidation: 'PASS',
    stateEvidenceValidation: 'PASS',
    deviceEvidenceValidation: 'PASS'
  }, null, 2));
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
