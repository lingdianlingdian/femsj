import { JsonAsset, resources } from 'cc';
import type { RuntimeConfig, RuntimeDay, RuntimeOrder } from './GameContentTypes';

const RUNTIME_PATH = 'generated/game_content_day001_110';

export class RuntimeConfigRepository {
  private config: RuntimeConfig | null = null;
  private days = new Map<number, RuntimeDay>();
  private orders = new Map<string, RuntimeOrder>();

  async load(): Promise<RuntimeConfig> {
    if (this.config) return this.config;
    const asset = await new Promise<JsonAsset>((resolve, reject) => {
      resources.load(RUNTIME_PATH, JsonAsset, (err, json) => err ? reject(err) : resolve(json));
    });
    const value = asset.json as unknown as RuntimeConfig;
    if (!value || value.days?.length !== 110 || value.orders?.length !== 651) throw new Error('Invalid full runtime config');
    this.config = value;
    this.days = new Map(value.days.map(x => [x.day, x]));
    this.orders = new Map(value.orders.map(x => [x.id, x]));
    return value;
  }

  getDay(day: number): RuntimeDay | null { return this.days.get(day) ?? null; }
  getOrder(id: string): RuntimeOrder | null { return this.orders.get(id) ?? null; }
}
