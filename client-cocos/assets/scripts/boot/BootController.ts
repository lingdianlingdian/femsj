import { _decorator, Component, Node } from 'cc';
import { ScreenRouter } from '../core/ScreenRouter';
const { ccclass, property } = _decorator;

@ccclass('BootController')
export class BootController extends Component {
  @property(Node)
  screenHost: Node | null = null;

  private router: ScreenRouter | null = null;

  async start(): Promise<void> {
    if (!this.screenHost) throw new Error('BootController.screenHost is required');
    this.router = new ScreenRouter(this.screenHost);
    await this.router.init();
    await this.router.open('/boot');
  }

  async open(route: string): Promise<void> {
    if (!this.router) throw new Error('ScreenRouter is not initialized');
    await this.router.open(route);
  }
}
