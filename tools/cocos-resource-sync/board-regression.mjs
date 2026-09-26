#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const modelPath = new URL('../../client-cocos/assets/scripts/board/BoardModel.ts', import.meta.url);
const source = fs.readFileSync(modelPath, 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { BoardModel } = await import(moduleUrl);

const mergeRules = {
  get(itemId) {
    return itemId === 'item_a'
      ? { inputItemId: 'item_a', outputItemId: 'item_b', transformationId: 'merge_a_b' }
      : null;
  }
};

const board = new BoardModel(mergeRules);
assert.equal(BoardModel.CELL_COUNT, 63);
assert.equal(board.getRevision(), 0);

// TC_BOARD_001: successful mutation increments revision and preserves instance identity on move.
const spawn = board.spawn(0, 'item_a', 'explicit_a');
assert.equal(spawn.revision, 1);
const moved = board.move(0, 1);
assert.equal(moved.revision, 2);
assert.equal(board.get(1).instanceId, 'explicit_a');
assert.equal(board.get(0), null);

// TC_BOARD_002: same item with a MERGE2 rule produces exactly one upgraded instance.
const mergeBoard = new BoardModel(mergeRules);
mergeBoard.spawn(0, 'item_a', 'merge_a_1');
mergeBoard.spawn(1, 'item_a', 'merge_a_2');
const mergeMutation = mergeBoard.move(0, 1);
assert.equal(mergeMutation.kind, 'MERGE');
assert.equal(mergeBoard.get(0), null);
assert.equal(mergeBoard.get(1).itemId, 'item_b');

// TC_BOARD_003: a non-mergeable occupied target leaves board state unchanged.
const rejectBoard = new BoardModel(mergeRules);
rejectBoard.spawn(0, 'item_a', 'reject_a');
rejectBoard.spawn(1, 'item_x', 'reject_x');
const rejectBefore = rejectBoard.snapshot();
const rejectRevision = rejectBoard.getRevision();
assert.throws(() => rejectBoard.move(0, 1), /non-mergeable/);
assert.deepEqual(rejectBoard.snapshot(), rejectBefore);
assert.equal(rejectBoard.getRevision(), rejectRevision);

// TC_BOARD_004: a full board cannot lose an instance on an invalid move.
const fullBoard = new BoardModel(mergeRules);
for (let cell = 0; cell < BoardModel.CELL_COUNT; cell += 1) {
  fullBoard.spawn(cell, cell % 2 === 0 ? 'item_a' : 'item_x', `full_${cell}`);
}
assert.equal(fullBoard.findFirstEmpty(), null);
const fullBefore = fullBoard.snapshot();
assert.throws(() => fullBoard.move(0, 1), /non-mergeable/);
assert.deepEqual(fullBoard.snapshot(), fullBefore);
assert.equal(fullBoard.snapshot().filter(Boolean).length, 63);

// TC_BOARD_007 / 008: LOCKED and BLOCKED cells reject placement/operation.
board.setCellState(2, 'LOCKED');
const revisionAfterLock = board.getRevision();
assert.throws(() => board.spawn(2, 'item_a'), /LOCKED/);
assert.equal(board.getRevision(), revisionAfterLock);

board.setCellState(3, 'BLOCKED');
const revisionAfterBlock = board.getRevision();
assert.throws(() => board.move(1, 3), /BLOCKED/);
assert.equal(board.getRevision(), revisionAfterBlock);

// Explicit and generated IDs may never collide, including consumed historical IDs.
assert.throws(() => board.spawn(4, 'item_a', 'explicit_a'), /Duplicate board instanceId/);
board.spawn(4, 'item_a', 'board_item_1');
const generated = board.spawn(5, 'item_a');
assert.equal(generated.outputInstance.instanceId, 'board_item_2');

// Merge consumes two instances and creates one new unique output instance.
const merged = board.move(4, 5);
assert.equal(merged.kind, 'MERGE');
assert.equal(merged.outputInstance.itemId, 'item_b');
assert.notEqual(merged.outputInstance.instanceId, 'board_item_1');
assert.notEqual(merged.outputInstance.instanceId, 'board_item_2');
assert.equal(board.get(4), null);
assert.equal(board.get(5).itemId, 'item_b');

// Empty-cell lookup must ignore non-operable cells.
const board2 = new BoardModel(mergeRules);
board2.setCellState(0, 'LOCKED');
board2.setCellState(1, 'BLOCKED');
assert.equal(board2.findFirstEmpty(), 2);

// Invalid cell/state and occupied-cell locking are rejected without corrupting state.
assert.throws(() => board2.setCellState(99, 'OPEN'), /Invalid board cell/);
assert.throws(() => board2.setCellState(2, 'INVALID'), /Invalid board cell state/);
board2.spawn(2, 'item_a');
assert.throws(() => board2.setCellState(2, 'LOCKED'), /occupied/);

console.log(JSON.stringify({
  status: 'PASS',
  cells: BoardModel.CELL_COUNT,
  covers: [
    'TC_BOARD_001 revision + move identity',
    'TC_BOARD_002 legal merge',
    'TC_BOARD_003 illegal merge preserves state',
    'TC_BOARD_004 full board preserves instances',
    'TC_BOARD_007 LOCKED',
    'TC_BOARD_008 BLOCKED',
    'instanceId uniqueness',
    'merge uniqueness',
    'first empty operable cell'
  ]
}, null, 2));
