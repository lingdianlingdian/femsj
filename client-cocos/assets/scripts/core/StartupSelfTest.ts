import { BoardModel } from '../board/BoardModel';
import { MergeRuleIndex } from '../board/MergeRuleIndex';
import { GameAppContext } from './GameAppContext';
import { ScreenContractRepository } from './ScreenContractRepository';

export interface StartupSelfTestReport {
  result: 'PASS' | 'FAIL';
  checks: Record<string, boolean | number | string>;
  errors: string[];
}

export class StartupSelfTest {
  constructor(
    private readonly app: GameAppContext,
    private readonly contracts = new ScreenContractRepository()
  ) {}

  async run(): Promise<StartupSelfTestReport> {
    const checks: Record<string, boolean | number | string> = {};
    const errors: string[] = [];

    try {
      await this.app.initialize();
      const runtime = await this.app.runtime.load();
      checks.runtimeDays = runtime.days.length;
      checks.runtimeOrders = runtime.orders.length;
      checks.runtimeItems = runtime.items.length;
      checks.runtimeRecipes = runtime.recipes.length;
      if (runtime.days.length !== 110) errors.push(`runtime days=${runtime.days.length}`);
      if (runtime.orders.length !== 651) errors.push(`runtime orders=${runtime.orders.length}`);

      checks.assetMapCount = this.app.assets.count;
      if (this.app.assets.count !== 389) errors.push(`asset map count=${this.app.assets.count}`);
      const firstAssetId = String(runtime.items[0]?.assetId ?? '');
      if (!firstAssetId) errors.push('runtime first item has no assetId');
      else checks.firstAssetPath = this.app.assets.getResourcePath(firstAssetId);

      const manifest = await this.contracts.load();
      checks.screenContracts = manifest.screens.length;
      if (manifest.screens.length !== 46) errors.push(`screen contracts=${manifest.screens.length}`);

      const parameterized = this.contracts.resolveRoute('/board/order/startup-self-test');
      checks.parameterizedRoute = parameterized?.params.id === 'startup-self-test';
      if (parameterized?.params.id !== 'startup-self-test') errors.push('parameterized route resolution failed');

      const modal = this.contracts.resolveRoute('modal:offline');
      checks.modalRoute = modal?.contract.route === 'modal:offline';
      if (!modal) errors.push('modal route resolution failed');

      await this.app.loadStoryForDay(1);
      const dialogue = this.app.dialogue.resolve('story_day_001_entry');
      checks.day1DialogueLines = dialogue.length;
      if (!dialogue.length) errors.push('Day1 entry dialogue is empty');

      const board = new BoardModel(new MergeRuleIndex(runtime.transformations));
      board.spawn(0, 'item_kafeidou', 'startup_a');
      board.spawn(1, 'item_kafeidou', 'startup_b');
      const mutation = board.move(0, 1);
      checks.merge2Output = mutation.outputInstance?.itemId ?? '';
      if (mutation.kind !== 'MERGE' || mutation.outputInstance?.itemId !== 'item_nongsuokafei') {
        errors.push('Merge-2 startup probe failed');
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    return {
      result: errors.length ? 'FAIL' : 'PASS',
      checks,
      errors
    };
  }
}
