import { instantiate, Node, Prefab, resources } from 'cc';
import type { ScreenRouteResolution } from './ScreenContract';
import { ScreenContractRepository } from './ScreenContractRepository';

export class ScreenRouter {
  private current: Node | null = null;
  private currentRoute: ScreenRouteResolution | null = null;
  readonly contracts = new ScreenContractRepository();

  constructor(private readonly host: Node) {}

  async init(): Promise<void> {
    await this.contracts.load();
  }

  async open(route: string): Promise<Node> {
    const resolved = this.contracts.resolveRoute(route);
    if (!resolved) throw new Error(`Unknown screen route: ${route}`);

    const prefab = await new Promise<Prefab>((resolve, reject) => {
      resources.load(
        resolved.contract.prefabResourcePath,
        Prefab,
        (err, asset) => err ? reject(err) : resolve(asset)
      );
    });

    const next = instantiate(prefab);
    this.current?.destroy();
    this.current = next;
    this.currentRoute = resolved;
    this.host.addChild(next);
    return next;
  }

  getCurrentRoute(): ScreenRouteResolution | null {
    if (!this.currentRoute) return null;
    return {
      requestedRoute: this.currentRoute.requestedRoute,
      contract: this.currentRoute.contract,
      params: { ...this.currentRoute.params }
    };
  }

  clear(): void {
    this.current?.destroy();
    this.current = null;
    this.currentRoute = null;
  }
}
