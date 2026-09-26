import type { ScreenPrefabContract } from './ScreenContract';

export class ScreenViewStateController {
  private currentState: string;

  constructor(private readonly contract: ScreenPrefabContract) {
    const initial = contract.states.includes('LOADING')
      ? 'LOADING'
      : contract.states.includes('READY')
        ? 'READY'
        : contract.states[0];
    if (!initial) throw new Error(`${contract.screenId}: no screen states declared`);
    this.currentState = initial;
  }

  get state(): string {
    return this.currentState;
  }

  canTransition(next: string): boolean {
    return this.contract.states.includes(next);
  }

  transition(next: string): string {
    if (!this.canTransition(next)) {
      throw new Error(`${this.contract.screenId}: unsupported state ${next}`);
    }
    this.currentState = next;
    return this.currentState;
  }
}
