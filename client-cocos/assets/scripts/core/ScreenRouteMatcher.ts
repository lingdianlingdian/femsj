/**
 * Pure route-pattern matcher shared by the Cocos runtime and Node regression tests.
 *
 * Parameter syntax is intentionally limited to path segments such as ":id".
 * Non-path routes (for example "modal:offline") are always treated as literals.
 */

const PARAM_SEGMENT = /^:([A-Za-z_][A-Za-z0-9_]*)$/;

export function isParameterizedRoutePattern(pattern) {
  if (typeof pattern !== 'string' || !pattern.startsWith('/')) return false;
  return pattern.split('/').some((segment) => PARAM_SEGMENT.test(segment));
}

export function matchRoutePattern(pattern, route) {
  if (typeof pattern !== 'string' || typeof route !== 'string') return null;

  if (!isParameterizedRoutePattern(pattern)) {
    return pattern === route ? {} : null;
  }

  if (!route.startsWith('/')) return null;

  const patternSegments = pattern.split('/');
  const routeSegments = route.split('/');
  if (patternSegments.length !== routeSegments.length) return null;

  const params = {};
  for (let i = 0; i < patternSegments.length; i += 1) {
    const patternSegment = patternSegments[i];
    const routeSegment = routeSegments[i];
    const parameter = PARAM_SEGMENT.exec(patternSegment);

    if (!parameter) {
      if (patternSegment !== routeSegment) return null;
      continue;
    }

    if (!routeSegment) return null;

    try {
      params[parameter[1]] = decodeURIComponent(routeSegment);
    } catch {
      return null;
    }
  }

  return params;
}

export function createScreenRouteIndex(contracts) {
  const exact = new Map();
  const parameterized = [];
  const seenRoutes = new Set();
  const seenParameterizedShapes = new Set();

  for (const contract of contracts) {
    const route = contract?.route;
    if (typeof route !== 'string' || route.length === 0) {
      throw new Error('Screen contract contains an invalid route');
    }
    if (seenRoutes.has(route)) {
      throw new Error(`Duplicate screen route contract: ${route}`);
    }
    seenRoutes.add(route);

    if (isParameterizedRoutePattern(route)) {
      const segments = route.split('/');
      for (const segment of segments) {
        if (segment.startsWith(':') && !PARAM_SEGMENT.test(segment)) {
          throw new Error(`Invalid screen route parameter segment: ${route}`);
        }
      }

      const shape = segments.map((segment) => PARAM_SEGMENT.test(segment) ? ':' : segment).join('/');
      if (seenParameterizedShapes.has(shape)) {
        throw new Error(`Ambiguous parameterized screen route contract: ${route}`);
      }
      seenParameterizedShapes.add(shape);
      parameterized.push(contract);
    } else {
      exact.set(route, contract);
    }
  }

  parameterized.sort((a, b) => routeSpecificity(b.route) - routeSpecificity(a.route));
  return { exact, parameterized };
}

export function resolveScreenRoute(index, route) {
  if (!index || typeof route !== 'string' || route.length === 0) return null;

  const exact = index.exact.get(route);
  if (exact) return { contract: exact, params: {} };

  for (const contract of index.parameterized) {
    const params = matchRoutePattern(contract.route, route);
    if (params) return { contract, params };
  }

  return null;
}

function routeSpecificity(pattern) {
  return pattern
    .split('/')
    .reduce((score, segment) => score + (PARAM_SEGMENT.test(segment) ? 0 : 10) + 1, 0);
}
