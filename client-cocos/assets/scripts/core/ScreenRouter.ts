import { instantiate, Node, Prefab, resources } from 'cc';
import { ScreenContractRepository } from './ScreenContractRepository';

export class ScreenRouter {
  private current: Node | null = null;
  readonly contracts = new ScreenContractRepository();

  constructor(private readonly host: Node) {}

  async init(): Promise<void> {
    await this.contracts.load();
  }

  async open(route: string): Promise<Node> {
    const contract = this.contracts.getByRoute(route);
    if (!contract) throw new Error(`Unknown screen route: ${route}`);
    const prefab = await new Promise<Prefab>((resolve, reject) => {
      resources.load(contract.prefabResourcePath, Prefab, (err, asset) => err ? reject(err) : resolve(asset));
    });
    const next = instantiate(prefab);
    this.current?.destroy();
    this.current = next;
    this.host.addChild(next);
    return next;
  }

  clear(): void {
    this.current?.destroy();
    this.current = null;
  }
}
