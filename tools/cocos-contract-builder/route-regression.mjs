#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matcherPath = new URL('../../client-cocos/assets/scripts/core/ScreenRouteMatcher.ts', import.meta.url);
const matcherSource = fs.readFileSync(matcherPath, 'utf8');
const matcherModuleUrl = `data:text/javascript;base64,${Buffer.from(matcherSource).toString('base64')}`;
const {
  createScreenRouteIndex,
  matchRoutePattern,
  resolveScreenRoute
} = await import(matcherModuleUrl);

const screens = JSON.parse(
  fs.readFileSync(new URL('../../production-data/v4/ui/screens_v4.json', import.meta.url), 'utf8')
).screens;

assert.equal(screens.length, 46, 'Expected the 46-screen V4 contract');

const parameterized = screens.filter((screen) =>
  screen.route.startsWith('/') && screen.route.split('/').some((segment) => segment.startsWith(':'))
);
const modals = screens.filter((screen) => screen.route.startsWith('modal:'));

assert.equal(parameterized.length, 16, 'Parameterized route count changed; review route regression coverage');
assert.equal(modals.length, 3, 'Modal route count changed; review literal modal coverage');

const index = createScreenRouteIndex(screens);

function expectRoute(route, contractRoute, expectedParams = {}) {
  const resolved = resolveScreenRoute(index, route);
  assert.ok(resolved, `Expected route to resolve: ${route}`);
  assert.equal(resolved.contract.route, contractRoute);
  assert.deepEqual(resolved.params, expectedParams);
}

// Static routes stay exact, including precedence over a compatible dynamic route.
expectRoute('/boot', '/boot');
expectRoute('/story/opening', '/story/opening');

// Every parameterized contract must resolve a concrete route and expose decoded params.
for (const screen of parameterized) {
  const expectedParams = {};
  const concreteRoute = screen.route
    .split('/')
    .map((segment) => {
      if (!segment.startsWith(':')) return segment;
      const key = segment.slice(1);
      const value = `${key}-123`;
      expectedParams[key] = value;
      return encodeURIComponent(value);
    })
    .join('/');

  expectRoute(concreteRoute, screen.route, expectedParams);
}

// Named regressions for the routes that exposed the production bug.
expectRoute('/board/order/123', '/board/order/:id', { id: '123' });
expectRoute('/build/build-42', '/build/:id', { id: 'build-42' });
expectRoute('/story/scene%201', '/story/:id', { id: 'scene 1' });
expectRoute('/ranking/race-s1', '/ranking/:event', { event: 'race-s1' });

// Modal contracts use ':' as a literal namespace delimiter, never as path parameters.
for (const screen of modals) {
  expectRoute(screen.route, screen.route, {});
  assert.deepEqual(matchRoutePattern(screen.route, screen.route), {});
}
assert.equal(matchRoutePattern('modal:offline', 'modal:anything'), null);

// Invalid or incomplete routes must not partially match.
for (const route of [
  '',
  '/unknown',
  '/board/order',
  '/board/order/',
  '/board/order/123/extra',
  '/build',
  '/build/42/extra',
  '/ranking',
  '/ranking/',
  '/story/%E0%A4%A',
  'modal:unknown',
  'modal:offline/extra'
]) {
  assert.equal(resolveScreenRoute(index, route), null, `Expected invalid route to fail: ${route}`);
}

console.log(JSON.stringify({
  status: 'PASS',
  screens: screens.length,
  parameterizedRoutes: parameterized.length,
  modalRoutes: modals.length,
  cases: 'static + all parameterized + named extraction + invalid + modal literals'
}, null, 2));
