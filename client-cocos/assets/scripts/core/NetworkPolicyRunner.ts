import type { ScreenNetworkContract } from './ScreenContract';

export interface NetworkRunOptions {
  idempotent: boolean;
  maxAttempts?: number;
}

export class NetworkPolicyRunner {
  constructor(private readonly contract: ScreenNetworkContract) {}

  async run<T>(operation: (attempt: number) => Promise<T>, options: NetworkRunOptions): Promise<T> {
    const retryAllowed = this.contract.retry === 'safe-idempotent-only' && options.idempotent;
    const maxAttempts = Math.max(1, retryAllowed ? (options.maxAttempts ?? 2) : 1);
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.withTimeout(operation(attempt), this.contract.timeoutMs);
      } catch (error) {
        lastError = error;
        if (attempt >= maxAttempts) break;
      }
    }
    throw lastError;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Network timeout after ${timeoutMs}ms`)), timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
