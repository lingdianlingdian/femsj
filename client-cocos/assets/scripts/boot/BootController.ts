import { _decorator, Component, Node } from 'cc';
import { GameAppContext } from '../core/GameAppContext';
import { ScreenRouter } from '../core/ScreenRouter';
import { StartupSelfTest } from '../core/StartupSelfTest';
const { ccclass, property } = _decorator;

@ccclass('BootController')
export class BootController extends Component {
  @property(Node)
  screenHost: Node | null = null;

  private router: ScreenRouter | null = null;
  private readonly app = new GameAppContext();

  async start(): Promise<void> {
    if (!this.screenHost) throw new Error('BootController.screenHost is required');

    const report = await new StartupSelfTest(this.app).run();
    console.info('[femsj] startup self-test', JSON.stringify(report));
    if (report.result !== 'PASS') {
      throw new Error('Startup self-test failed: ' + report.errors.join('; '));
    }

    this.router = new ScreenRouter(this.screenHost);
    await this.router.init();
    await this.router.open('/boot');
  }

  async open(route: string): Promise<void> {
    if (!this.router) throw new Error('ScreenRouter is not initialized');
    await this.router.open(route);
  }
}
