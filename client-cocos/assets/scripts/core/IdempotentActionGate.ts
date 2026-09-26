export class IdempotentActionGate {
  private readonly inFlight = new Map<string, Promise<unknown>>();

  run<T>(key: string, action: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = Promise.resolve()
      .then(action)
      .finally(() => {
        if (this.inFlight.get(key) === promise) this.inFlight.delete(key);
      });
    this.inFlight.set(key, promise);
    return promise;
  }

  isPending(key: string): boolean {
    return this.inFlight.has(key);
  }

  clear(): void {
    this.inFlight.clear();
  }
}
