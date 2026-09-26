import type { Merge2Rule } from './BoardTypes';

interface RuntimeTransformation {
  id: string;
  type: string;
  inputs?: Array<{ itemId: string; count: number }>;
  outputs?: Array<{ type: string; id: string; amount: number }>;
}

export class MergeRuleIndex {
  private readonly byInput = new Map<string, Merge2Rule>();

  constructor(transformations: RuntimeTransformation[]) {
    for (const t of transformations) {
      if (t.type !== 'MERGE2') continue;
      const input = t.inputs?.find(x => x.count === 2);
      const output = t.outputs?.find(x => x.type === 'ITEM' && x.amount === 1);
      if (!input || !output) continue;
      this.byInput.set(input.itemId, {
        inputItemId: input.itemId,
        outputItemId: output.id,
        transformationId: t.id
      });
    }
  }

  get(inputItemId: string): Merge2Rule | null {
    return this.byInput.get(inputItemId) ?? null;
  }
}
