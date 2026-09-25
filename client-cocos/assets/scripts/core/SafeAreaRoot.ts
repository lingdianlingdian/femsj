import { _decorator, Component, SafeArea } from 'cc';
const { ccclass } = _decorator;

@ccclass('SafeAreaRoot')
export class SafeAreaRoot extends Component {
  onLoad(): void {
    const safeArea = this.getComponent(SafeArea) ?? this.addComponent(SafeArea);
    safeArea.updateArea();
  }
}
