# femsj Editor Bootstrap Extension

适用：Cocos Creator 3.8.x。

启用项目扩展后，在 **Developer -> FEMSJ** 可执行：

- **Generate V4 App Shell**：在当前空场景生成 `Canvas/SafeAreaRoot/ScreenHost`，并生成 UI00–UI45 共 46 个模板节点。
- **Audit V4 App Shell**：校验上述层级与 46 个 Screen ID 是否完整。

扩展使用 Creator 3.8 的 `contributions.scene.script` + `scene:execute-scene-script`，场景脚本调用引擎 API 创建节点和组件。

## 重要边界

此扩展只在 **Cocos Editor 场景进程**内创建真实节点，不直接手写 `.scene/.prefab/.meta` 序列化文件。

执行 Generate 后：

1. 将当前场景保存为 `App.scene`。
2. 将 `ScreenTemplateStaging` 下 UI00–UI45 逐个转换为对应 `assets/resources/ui/screens/UIxx.prefab`。
3. 再运行仓库的 Editor acceptance audit，把状态从 `PENDING_EDITOR_GENERATION` 提升为 `READY`。
