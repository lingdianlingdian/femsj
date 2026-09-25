import { JsonAsset, resources } from 'cc';
import type { ScreenPrefabContract, ScreenPrefabManifest } from './ScreenContract';

const MANIFEST_PATH = 'generated/screen_prefab_map_v4';

export class ScreenContractRepository {
  private manifest: ScreenPrefabManifest | null = null;
  private byRoute = new Map<string, ScreenPrefabContract>();

  async load(): Promise<ScreenPrefabManifest> {
    if (this.manifest) return this.manifest;
    const asset = await new Promise<JsonAsset>((resolve, reject) => {
      resources.load(MANIFEST_PATH, JsonAsset, (err, json) => err ? reject(err) : resolve(json));
    });
    const value = asset.json as unknown as ScreenPrefabManifest;
    if (!value || value.screens.length !== 46) throw new Error('Invalid V4 screen manifest');
    this.manifest = value;
    this.byRoute = new Map(value.screens.map(x => [x.route, x]));
    return value;
  }

  getByRoute(route: string): ScreenPrefabContract | null {
    return this.byRoute.get(route) ?? null;
  }
}
