import { AssetIdResolver } from './AssetIdResolver';
import { RuntimeConfigRepository } from '../runtime/RuntimeConfigRepository';
import { DialoguePlayer } from '../story/DialoguePlayer';
import { DialogueRepository } from '../story/DialogueRepository';
import { BoardModel } from '../board/BoardModel';
import { MergeRuleIndex } from '../board/MergeRuleIndex';

export class GameAppContext {
  readonly assets = new AssetIdResolver();
  readonly runtime = new RuntimeConfigRepository();
  readonly dialogue = new DialogueRepository();
  readonly dialoguePlayer = new DialoguePlayer();
  board: BoardModel | null = null;

  async initialize(): Promise<void> {
    const runtime = await this.runtime.load();
    await this.assets.load();
    this.board = new BoardModel(new MergeRuleIndex(runtime.transformations));
  }

  async loadStoryForDay(day: number): Promise<void> {
    if (!Number.isInteger(day) || day < 1 || day > 110) throw new Error(`Invalid day: ${day}`);
    const min = Math.floor((day - 1) / 10) * 10 + 1;
    const max = Math.min(110, min + 9);
    await this.dialogue.loadSlice(min, max);
  }
}
