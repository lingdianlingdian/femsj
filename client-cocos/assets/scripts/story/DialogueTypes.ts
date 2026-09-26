export interface DialogueLine { speakerId: string; textKey: string; emotion?: string; animation?: string; }
export interface DialogueScene { id: string; day: number; trigger: string; buildNodeId?: string | null; lines: DialogueLine[]; }
export interface StorySlice { version: string; scenes: DialogueScene[]; }
export interface LocaleTable { version: string; entries?: Record<string, string>; strings?: Record<string, string>; [key: string]: unknown; }
export interface ResolvedDialogueLine extends DialogueLine { text: string; }
