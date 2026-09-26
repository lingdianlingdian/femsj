const VALID_CELL_STATES = new Set(['OPEN', 'LOCKED', 'BLOCKED']);

export class BoardModel {
  static WIDTH = 9;
  static HEIGHT = 7;
  static CELL_COUNT = BoardModel.WIDTH * BoardModel.HEIGHT;

  mergeRules;
  cells;
  cellStates;
  usedInstanceIds;
  sequence = 0;
  revision = 0;

  constructor(mergeRules) {
    this.mergeRules = mergeRules;
    this.cells = Array(BoardModel.CELL_COUNT).fill(null);
    this.cellStates = Array(BoardModel.CELL_COUNT).fill('OPEN');
    this.usedInstanceIds = new Set();
    this.sequence = 0;
    this.revision = 0;
  }

  get(cell) {
    this.assertCell(cell);
    const item = this.cells[cell];
    return item ? { ...item } : null;
  }

  getCellState(cell) {
    this.assertCell(cell);
    return this.cellStates[cell];
  }

  getRevision() {
    return this.revision;
  }

  snapshot() {
    return this.cells.map((item) => item ? { ...item } : null);
  }

  setCellState(cell, state) {
    this.assertCell(cell);
    if (!VALID_CELL_STATES.has(state)) throw new Error(`Invalid board cell state: ${state}`);
    if (state !== 'OPEN' && this.cells[cell]) {
      throw new Error(`Cannot mark occupied board cell ${cell} as ${state}`);
    }
    if (this.cellStates[cell] === state) return this.revision;
    this.cellStates[cell] = state;
    this.revision += 1;
    return this.revision;
  }

  spawn(cell, itemId, instanceId) {
    this.assertOperableCell(cell);
    if (this.cells[cell]) throw new Error(`Board cell ${cell} is occupied`);
    if (typeof itemId !== 'string' || !itemId) throw new Error('itemId is required');

    const id = instanceId ?? this.nextId();
    this.reserveInstanceId(id);
    const outputInstance = { instanceId: id, itemId };
    this.cells[cell] = outputInstance;
    return this.commit({ kind: 'SPAWN', toCell: cell, outputInstance: { ...outputInstance } });
  }

  move(fromCell, toCell) {
    this.assertOperableCell(fromCell);
    this.assertOperableCell(toCell);
    if (fromCell === toCell) throw new Error('Source and target cells are identical');

    const source = this.cells[fromCell];
    if (!source) throw new Error(`Board cell ${fromCell} is empty`);
    const target = this.cells[toCell];

    if (!target) {
      this.cells[fromCell] = null;
      this.cells[toCell] = source;
      return this.commit({
        kind: 'MOVE',
        fromCell,
        toCell,
        inputInstanceIds: [source.instanceId]
      });
    }

    if (target.itemId !== source.itemId) {
      throw new Error('Target occupied by a non-mergeable item');
    }

    const rule = this.mergeRules.get(source.itemId);
    if (!rule) throw new Error(`No MERGE2 rule for ${source.itemId}`);

    const outputInstance = {
      instanceId: this.nextId(),
      itemId: rule.outputItemId
    };
    this.reserveInstanceId(outputInstance.instanceId);
    this.cells[fromCell] = null;
    this.cells[toCell] = outputInstance;

    return this.commit({
      kind: 'MERGE',
      fromCell,
      toCell,
      inputInstanceIds: [source.instanceId, target.instanceId],
      outputInstance: { ...outputInstance }
    });
  }

  remove(cell) {
    this.assertOperableCell(cell);
    const item = this.cells[cell];
    if (!item) throw new Error(`Board cell ${cell} is empty`);
    this.cells[cell] = null;
    return this.commit({
      kind: 'REMOVE',
      fromCell: cell,
      inputInstanceIds: [item.instanceId]
    });
  }

  findFirstEmpty() {
    const index = this.cells.findIndex(
      (item, cell) => item === null && this.cellStates[cell] === 'OPEN'
    );
    return index < 0 ? null : index;
  }

  commit(mutation) {
    this.revision += 1;
    return { ...mutation, revision: this.revision };
  }

  nextId() {
    let id;
    do {
      this.sequence += 1;
      id = `board_item_${this.sequence}`;
    } while (this.usedInstanceIds.has(id));
    return id;
  }

  reserveInstanceId(instanceId) {
    if (typeof instanceId !== 'string' || !instanceId) {
      throw new Error('instanceId is required');
    }
    if (this.usedInstanceIds.has(instanceId)) {
      throw new Error(`Duplicate board instanceId: ${instanceId}`);
    }
    this.usedInstanceIds.add(instanceId);
  }

  assertOperableCell(cell) {
    this.assertCell(cell);
    const state = this.cellStates[cell];
    if (state !== 'OPEN') throw new Error(`Board cell ${cell} is ${state}`);
  }

  assertCell(cell) {
    if (!Number.isInteger(cell) || cell < 0 || cell >= BoardModel.CELL_COUNT) {
      throw new Error(`Invalid board cell: ${cell}`);
    }
  }
}
