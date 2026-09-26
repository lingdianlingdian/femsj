import type { ScreenPrefabContract } from './ScreenContract';
import { IdempotentActionGate } from './IdempotentActionGate';
import { NetworkPolicyRunner } from './NetworkPolicyRunner';
import { ScreenViewStateController } from './ScreenViewStateController';

export class ScreenRuntimeSession {
  readonly viewState: ScreenViewStateController;
  readonly actionGate = new IdempotentActionGate();
  readonly network: NetworkPolicyRunner | null;

  constructor(readonly contract: ScreenPrefabContract) {
    this.viewState = new ScreenViewStateController(contract);
    this.network = contract.network ? new NetworkPolicyRunner(contract.network) : null;
  }

  runIdempotent<T>(idempotencyKey: string, action: () => Promise<T>): Promise<T> {
    return this.actionGate.run(idempotencyKey, action);
  }

  destroy(): void {
    this.actionGate.clear();
  }
}
