import { EventTarget } from 'cc';
import type { ResolvedDialogueLine } from './DialogueTypes';

export const DialogueEvents = { LINE: 'line', COMPLETE: 'complete', CANCEL: 'cancel' } as const;

export class DialoguePlayer {
  readonly events = new EventTarget();
  private lines: ResolvedDialogueLine[] = [];
  private index = -1;

  play(lines: ResolvedDialogueLine[]): void {
    this.lines = [...lines];
    this.index = -1;
    this.next();
  }

  next(): ResolvedDialogueLine | null {
    this.index += 1;
    if (this.index >= this.lines.length) {
      this.events.emit(DialogueEvents.COMPLETE);
      return null;
    }
    const line = this.lines[this.index];
    this.events.emit(DialogueEvents.LINE, line, this.index, this.lines.length);
    return line;
  }

  cancel(): void {
    this.lines = [];
    this.index = -1;
    this.events.emit(DialogueEvents.CANCEL);
  }
}
