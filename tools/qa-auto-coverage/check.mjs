#!/usr/bin/env node
import fs from 'node:fs';

const strict = process.argv.includes('--strict');
const qa = JSON.parse(fs.readFileSync('qa/v4/test_cases_v4.json', 'utf8'));
const coverage = JSON.parse(fs.readFileSync('qa/v4/automation_coverage_v4.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const cases = qa.cases || [];
const auto = cases.filter(c => c.automation === 'AUTO');
const byId = new Map(cases.map(c => [c.id, c]));
const errors = [];
const seen = new Set();

for (const row of coverage.executed || []) {
  if (seen.has(row.id)) errors.push('duplicate coverage id: ' + row.id);
  seen.add(row.id);

  const test = byId.get(row.id);
  if (!test) {
    errors.push('coverage references unknown QA id: ' + row.id);
    continue;
  }
  if (test.automation !== 'AUTO') {
    errors.push('coverage marks non-AUTO case as executed: ' + row.id);
  }

  const match = /^npm run ([^\s]+)$/.exec(row.runner || '');
  if (!match || !pkg.scripts?.[match[1]]) {
    errors.push('coverage runner is not a package script: ' + row.id + ' -> ' + row.runner);
  }
}

const executedAuto = auto.filter(c => seen.has(c.id));
const gaps = auto.filter(c => !seen.has(c.id));
const byArea = {};
for (const c of gaps) byArea[c.area] = (byArea[c.area] || 0) + 1;

const report = {
  totalQa: cases.length,
  autoContract: auto.length,
  autoExecuted: executedAuto.length,
  autoCoverage: auto.length ? Number((executedAuto.length / auto.length).toFixed(4)) : 1,
  remainingAutoGaps: gaps.length,
  gapsByArea: byArea,
  executedIds: executedAuto.map(c => c.id),
  errors
};

console.log(JSON.stringify(report, null, 2));

if (errors.length || (strict && gaps.length)) process.exit(1);
