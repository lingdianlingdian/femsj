import { JsonAsset, resources } from 'cc';
import type {
  ScreenPrefabContract,
  ScreenPrefabManifest,
  ScreenRouteResolution
} from './ScreenContract';
import { createScreenRouteIndex, resolveScreenRoute } from './ScreenRouteMatcher';

const MANIFEST_PATH = 'generated/screen_prefab_map_v4';

export class ScreenContractRepository {
  private manifest: ScreenPrefabManifest | null = null;
  private routeIndex: ReturnType<typeof createScreenRouteIndex> | null = null;

  async load(): Promise<ScreenPrefabManifest> {
    if (this.manifest) return this.manifest;
    const asset = await new Promise<JsonAsset>((resolve, reject) => {
      resources.load(MANIFEST_PATH, JsonAsset, (err, json) => err ? reject(err) : resolve(json));
    });
    const value = asset.json as unknown as ScreenPrefabManifest;
    if (!value || value.screens.length !== 46) throw new Error('Invalid V4 screen manifest');

    this.manifest = value;
    this.routeIndex = createScreenRouteIndex(value.screens);
    return value;
  }

  resolveRoute(route: string): ScreenRouteResolution | null {
    if (!this.routeIndex) return null;
    const match = resolveScreenRoute(this.routeIndex, route) as {
      contract: ScreenPrefabContract;
      params: Record<string, string>;
    } | null;

    if (!match) return null;
    return {
      requestedRoute: route,
      contract: match.contract,
      params: { ...match.params }
    };
  }

  getByRoute(route: string): ScreenPrefabContract | null {
    return this.resolveRoute(route)?.contract ?? null;
  }
}
