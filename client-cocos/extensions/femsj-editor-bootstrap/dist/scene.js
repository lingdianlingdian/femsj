'use strict';

const { join } = require('path');
module.paths.push(join(Editor.App.path, 'node_modules'));

function requireEngine() {
  return require('cc');
}

function ensureChild(parent, name) {
  let node = parent.getChildByName(name);
  if (!node) {
    const { Node } = requireEngine();
    node = new Node(name);
    parent.addChild(node);
  }
  return node;
}

function ensureComponent(node, Type) {
  return node.getComponent(Type) || node.addComponent(Type);
}

function configureFullRect(node, width, height) {
  const { UITransform, Widget } = requireEngine();
  const transform = ensureComponent(node, UITransform);
  transform.setContentSize(width, height);
  const widget = ensureComponent(node, Widget);
  widget.isAlignLeft = true;
  widget.isAlignRight = true;
  widget.isAlignTop = true;
  widget.isAlignBottom = true;
  widget.left = 0;
  widget.right = 0;
  widget.top = 0;
  widget.bottom = 0;
}

function findShell() {
  const { director } = requireEngine();
  const scene = director.getScene();
  if (!scene) throw new Error('No active scene. Create/open an empty scene first.');
  const canvas = scene.getChildByName('Canvas');
  const safeAreaRoot = canvas && canvas.getChildByName('SafeAreaRoot');
  const screenHost = safeAreaRoot && safeAreaRoot.getChildByName('ScreenHost');
  const templates = safeAreaRoot && safeAreaRoot.getChildByName('ScreenTemplateStaging');
  return { scene, canvas, safeAreaRoot, screenHost, templates };
}

exports.load = function load() {};
exports.unload = function unload() {};

exports.methods = {
  generateAppShell(screenIds) {
    const { Canvas, SafeArea } = requireEngine();
    const { scene } = findShell();

    const canvas = ensureChild(scene, 'Canvas');
    ensureComponent(canvas, Canvas);
    configureFullRect(canvas, 750, 1334);

    const safeAreaRoot = ensureChild(canvas, 'SafeAreaRoot');
    ensureComponent(safeAreaRoot, SafeArea);
    configureFullRect(safeAreaRoot, 750, 1334);

    const screenHost = ensureChild(safeAreaRoot, 'ScreenHost');
    configureFullRect(screenHost, 750, 1334);

    const templates = ensureChild(safeAreaRoot, 'ScreenTemplateStaging');
    configureFullRect(templates, 750, 1334);
    templates.active = false;

    const expected = new Set(screenIds);
    for (const screenId of screenIds) {
      const node = ensureChild(templates, screenId);
      configureFullRect(node, 750, 1334);
      node.active = false;
    }

    for (const child of [...templates.children]) {
      if (!expected.has(child.name)) child.destroy();
    }

    return {
      result: 'GENERATED_IN_ACTIVE_SCENE',
      canvas: canvas.name,
      safeAreaRoot: safeAreaRoot.name,
      screenHost: screenHost.name,
      screenTemplates: templates.children.map((x) => x.name).sort(),
      screenCount: templates.children.length,
      next: 'Save as App.scene, then convert each staging child to a prefab using Creator asset workflow.',
    };
  },

  auditAppShell(screenIds) {
    const { canvas, safeAreaRoot, screenHost, templates } = findShell();
    const actual = new Set((templates && templates.children || []).map((x) => x.name));
    const missing = screenIds.filter((id) => !actual.has(id));
    const extra = [...actual].filter((id) => !screenIds.includes(id));
    return {
      result: canvas && safeAreaRoot && screenHost && templates && missing.length === 0 && extra.length === 0 ? 'PASS' : 'FAIL',
      hasCanvas: !!canvas,
      hasSafeAreaRoot: !!safeAreaRoot,
      hasScreenHost: !!screenHost,
      hasTemplateStaging: !!templates,
      expectedScreens: screenIds.length,
      actualScreens: actual.size,
      missing,
      extra,
    };
  },
};
