import type { BoardItemInstance, BoardMutation } from './BoardTypes';
import { MergeRuleIndex } from './MergeRuleIndex';

export class BoardModel {
  static readonly WIDTH = 9;
  static readonly HEIGHT = 7;
  static readonly CELL_COUNT = BoardModel.WIDTH * BoardModel.HEIGHT;

  private readonly cells: Array<BoardItemInstance | null> = Array(BoardModel.CELL_COUNT).fill(null);
  private sequence = 0;

  constructor(private readonly mergeRules: MergeRuleIndex) {}

  get(cell: number): BoardItemInstance | null {
    this.assertCell(cell);
    return this.cells[cell];
  }

  snapshot(): ReadonlyArray<BoardItemInstance | null> {
    return this.cells.map(x => x ? { ...x } : null);
  }

  spawn(cell: number, itemId: string, instanceId?: string): BoardMutation {
    this.assertCell(cell);
    if (this.cells[cell]) throw new Error(`Board cell ${cell} is occupied`);
    const outputInstance = { instanceId: instanceId ?? this.nextId(), itemId };
    this.cells[cell] = outputInstance;
    return { kind: 'SPAWN', toCell: cell, outputInstance: { ...outputInstance } };
  }

  move(fromCell: number, toCell: number): BoardMutation {
    this.assertCell(fromCell);
    this.assertCell(toCell);
    if (fromCell === toCell) throw new Error('Source and target cells are identical');
    const source = this.cells[fromCell];
    if (!source) throw new Error(`Board cell ${fromCell} is empty`);
    const target = this.cells[toCell];
    if (!target) {
      this.cells[fromCell] = null;
      this.cells[toCell] = source;
      return { kind: 'MOVE', fromCell, toCell, inputInstanceIds: [source.instanceId] };
    }
    if (target.itemId !== source.itemId) throw new Error('Target occupied by a non-mergeable item');
    const rule = this.mergeRules.get(source.itemId);
    if (!rule) throw new Error(`No MERGE2 rule for ${source.itemId}`);
    const outputInstance = { instanceId: this.nextId(), itemId: rule.outputItemId };
    this.cells[fromCell] = null;
    this.cells[toCell] = outputInstance;
    return {
      kind: 'MERGE',
      fromCell,
      toCell,
      inputInstanceIds: [source.instanceId, target.instanceId],
      outputInstance: { ...outputInstance }
    };
  }

  remove(cell: number): BoardMutation {
    this.assertCell(cell);
    const item = this.cells[cell];
    if (!item) throw new Error(`Board cell ${cell} is empty`);
    this.cells[cell] = null;
    return { kind: 'REMOVE', fromCell: cell, inputInstanceIds: [item.instanceId] };
  }

  findFirstEmpty(): number | null {
    const i = this.cells.findIndex(x => x === null);
    return i < 0 ? null : i;
  }

  private nextId(): string {
    this.sequence += 1;
    return `board_item_${this.sequence}`;
  }

  private assertCell(cell: number): void {
    if (!Number.isInteger(cell) || cell < 0 || cell >= BoardModel.CELL_COUNT) {
      throw new Error(`Invalid board cell: ${cell}`);
    }
  }
}
