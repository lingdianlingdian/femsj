import fs from 'node:fs';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function missing(path) {
  return { path, exists: false, valid: true, result: 'PENDING', errors: [] };
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validTimestamp(value) {
  return nonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

export function inspectPngEvidence(path, expectedWidth, expectedHeight) {
  if (!path || !fs.existsSync(path)) return missing(path);

  const errors = [];
  let width = null;
  let height = null;
  try {
    const buffer = fs.readFileSync(path);
    if (buffer.length < 24) {
      errors.push('PNG file is too small to contain IHDR');
    } else {
      if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) errors.push('invalid PNG signature');
      if (buffer.toString('ascii', 12, 16) !== 'IHDR') errors.push('missing PNG IHDR chunk');
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
      if (width !== expectedWidth || height !== expectedHeight) {
        errors.push(`expected ${expectedWidth}x${expectedHeight}, got ${width}x${height}`);
      }
    }
  } catch (error) {
    errors.push(`cannot read PNG: ${error.message}`);
  }

  return {
    path,
    exists: true,
    valid: errors.length === 0,
    result: errors.length === 0 ? 'PASS' : 'FAIL',
    width,
    height,
    errors,
  };
}

export function inspectJsonEvidence(path, kind) {
  if (!path || !fs.existsSync(path)) return missing(path);

  let value;
  try {
    value = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    return {
      path,
      exists: true,
      valid: false,
      result: 'FAIL',
      declaredResult: null,
      errors: [`invalid JSON: ${error.message}`],
    };
  }

  const errors = [];
  const declaredResult = value?.result;
  if (!['PASS', 'FAIL'].includes(declaredResult)) errors.push('result must be PASS or FAIL');
  if (!validTimestamp(value?.testedAt)) errors.push('testedAt must be a parseable timestamp');
  if (!nonEmptyString(value?.notes)) errors.push('notes must be a non-empty string');

  if (kind === 'state') {
    if (!Array.isArray(value?.states) || value.states.length === 0 || value.states.some((x) => !nonEmptyString(x))) {
      errors.push('states must be a non-empty string array');
    }
  } else if (kind === 'device') {
    if (!nonEmptyString(value?.device)) errors.push('device must be a non-empty string');
    if (!nonEmptyString(value?.build)) errors.push('build must be a non-empty string');
  } else {
    errors.push(`unknown evidence kind: ${kind}`);
  }

  return {
    path,
    exists: true,
    valid: errors.length === 0,
    result: errors.length === 0 ? declaredResult : 'FAIL',
    declaredResult: declaredResult ?? null,
    value,
    errors,
  };
}
