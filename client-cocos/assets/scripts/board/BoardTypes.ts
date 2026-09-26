export interface BoardItemInstance {
  instanceId: string;
  itemId: string;
}

export interface Merge2Rule {
  inputItemId: string;
  outputItemId: string;
  transformationId: string;
}

export interface BoardMutation {
  kind: 'SPAWN' | 'MOVE' | 'MERGE' | 'REMOVE';
  fromCell?: number;
  toCell?: number;
  inputInstanceIds?: string[];
  outputInstance?: BoardItemInstance;
}
