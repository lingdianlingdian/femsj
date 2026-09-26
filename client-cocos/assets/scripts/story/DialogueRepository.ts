import { JsonAsset, resources } from 'cc';
import type { DialogueScene, LocaleTable, ResolvedDialogueLine, StorySlice } from './DialogueTypes';

export class DialogueRepository {
  private scenes = new Map<string, DialogueScene>();
  private locale = new Map<string, string>();

  async loadSlice(minDay: number, maxDay: number): Promise<void> {
    const suffix = `day${String(minDay).padStart(3, '0')}_${String(maxDay).padStart(3, '0')}`;
    const [story, locale] = await Promise.all([
      this.loadJson<StorySlice>(`story/story_dialogue_${suffix}`),
      this.loadJson<LocaleTable>(`story/locale_zh-CN_${suffix}`)
    ]);
    for (const scene of story.scenes || []) this.scenes.set(scene.id, scene);
    const table = locale.entries ?? locale.strings ?? this.extractFlatStrings(locale);
    for (const [key, value] of Object.entries(table)) this.locale.set(key, value);
  }

  getScene(id: string): DialogueScene | null { return this.scenes.get(id) ?? null; }

  resolve(sceneId: string): ResolvedDialogueLine[] {
    const scene = this.getScene(sceneId);
    if (!scene) throw new Error(`Unknown dialogue scene: ${sceneId}`);
    return scene.lines.map(line => ({ ...line, text: this.locale.get(line.textKey) ?? `[${line.textKey}]` }));
  }

  private async loadJson<T>(path: string): Promise<T> {
    const asset = await new Promise<JsonAsset>((resolve, reject) => {
      resources.load(path, JsonAsset, (err, json) => err ? reject(err) : resolve(json));
    });
    return asset.json as unknown as T;
  }

  private extractFlatStrings(value: LocaleTable): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(value)) if (typeof v === 'string') out[k] = v;
    return out;
  }
}
