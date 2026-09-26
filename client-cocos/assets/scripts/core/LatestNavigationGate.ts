export class LatestNavigationGate {
  private sequence = 0;

  begin(): number {
    this.sequence += 1;
    return this.sequence;
  }

  isCurrent(token: number): boolean {
    return token === this.sequence;
  }

  invalidate(): void {
    this.sequence += 1;
  }
}
