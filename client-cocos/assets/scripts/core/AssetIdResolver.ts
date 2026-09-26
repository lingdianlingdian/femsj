import { JsonAsset, resources, SpriteFrame } from 'cc';

interface AssetImportEntry {
  assetId: string;
  resourcePath: string;
  status: string;
}

interface AssetImportMap {
  count: number;
  assets: AssetImportEntry[];
}

const MAP_PATH = 'generated/asset_import_map_v4';

export class AssetIdResolver {
  private byId = new Map<string, AssetImportEntry>();

  async load(): Promise<void> {
    if (this.byId.size) return;
    const asset = await new Promise<JsonAsset>((resolve, reject) => {
      resources.load(MAP_PATH, JsonAsset, (err, json) => err ? reject(err) : resolve(json));
    });
    const map = asset.json as unknown as AssetImportMap;
    if (!map || map.assets?.length !== 389) throw new Error('Invalid V4 asset import map');
    this.byId = new Map(map.assets.map(x => [x.assetId, x]));
  }

  get count(): number {
    return this.byId.size;
  }

  getResourcePath(assetId: string): string {
    const entry = this.byId.get(assetId);
    if (!entry) throw new Error(`Unknown AssetId: ${assetId}`);
    return entry.resourcePath;
  }

  async loadSpriteFrame(assetId: string): Promise<SpriteFrame> {
    const path = `${this.getResourcePath(assetId)}/spriteFrame`;
    return new Promise<SpriteFrame>((resolve, reject) => {
      resources.load(path, SpriteFrame, (err, frame) => err ? reject(err) : resolve(frame));
    });
  }
}
