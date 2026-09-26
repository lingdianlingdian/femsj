'use strict';

const fs = require('fs');
const path = require('path');

const EXTENSION_NAME = 'femsj-editor-bootstrap';

function readScreenIds() {
  const file = path.join(Editor.Project.path, 'assets', 'resources', 'generated', 'screen_prefab_map_v4.json');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  const screenIds = (manifest.screens || []).map((x) => x.screenId);
  if (screenIds.length !== 46) throw new Error(`Expected 46 screens, got ${screenIds.length}`);
  return screenIds;
}

async function execute(method) {
  return Editor.Message.request('scene', 'execute-scene-script', {
    name: EXTENSION_NAME,
    method,
    args: [readScreenIds()],
  });
}

exports.load = function load() {};
exports.unload = function unload() {};
exports.methods = {
  async generateAppShell() {
    const result = await execute('generateAppShell');
    console.log('[femsj-editor-bootstrap] generateAppShell', JSON.stringify(result));
    return result;
  },
  async auditAppShell() {
    const result = await execute('auditAppShell');
    console.log('[femsj-editor-bootstrap] auditAppShell', JSON.stringify(result));
    return result;
  },
};
