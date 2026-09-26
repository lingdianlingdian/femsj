export interface RuntimeEvidence { kind: string; confidence?: string; note?: string; }
export interface RuntimeItem { id: string; name: string; [key: string]: unknown; }
export interface RuntimeTransformation {
  id: string;
  type: string;
  inputs?: Array<{ itemId: string; count: number }>;
  outputs?: Array<{ type: string; id: string; amount: number }>;
  [key: string]: unknown;
}
export interface RuntimeOrder { id: string; day: number; requirements: Array<{ itemId: string; count: number }>; [key: string]: unknown; }
export interface RuntimeDay { day: number; orderIds: string[]; storyBefore?: string | null; storyAfter?: string | null; [key: string]: unknown; }
export interface RuntimeConfig {
  configVersion: string;
  items: RuntimeItem[];
  transformations: RuntimeTransformation[];
  producers: unknown[];
  cookwares: unknown[];
  recipes: unknown[];
  orders: RuntimeOrder[];
  days: RuntimeDay[];
  buildNodes: unknown[];
  events: unknown[];
  [key: string]: unknown;
}
