# femsj Cocos Client

正式客户端目标：Cocos Creator 3.8 LTS + TypeScript + 微信小游戏优先。

## 当前已落地

- 本目录具备 Cocos Creator 项目标记：`package.json + assets/`。
- 46 个 V4 Screen 已生成稳定 `screenId / route / prefabResourcePath` 合同。
- 41 个共享 UI Component 已保留原 `prefab` 路径并映射为 resources 路径。
- `ScreenRouter` 使用 Cocos 3.8 `resources.load(..., Prefab)` 动态挂载页面。
- `SafeAreaRoot` 使用 Cocos 3.8 原生 `SafeArea` 组件。
- 逻辑基准 750×1334；高屏回归目标 750×1624。

## 架构

只保留一个持久 `App.scene`。46 页均作为 Prefab 挂载到 `ScreenHost`，避免频繁 Scene 切换。

```text
App.scene
└─ Canvas
   └─ SafeAreaRoot
      └─ ScreenHost
         └─ UIxx Prefab
```

## 仍未伪造的内容

仓库当前运行环境没有 Cocos Creator Editor，因此**没有手写假的 .scene/.prefab 序列化文件**。
所有映射当前为 `PENDING_EDITOR_GENERATION`。必须由 Cocos Creator 3.8 导入项目后生成正式 .meta / Scene / Prefab，再把状态提升为 `READY`。

## 接入顺序

1. 用 Cocos Creator 3.8 LTS 打开本目录。
2. 新建 `App.scene`，Canvas 下建立 `SafeAreaRoot/ScreenHost`。
3. 挂载 `SafeAreaRoot.ts` 与 `BootController.ts`。
4. 先生成 UI00 / UI01 / UI02 三个核心 Prefab，验证路由和适配。
5. 按 `screen_prefab_map_v4.json` 扩至 46/46。
6. 将 41 个共享组件按 `components_v4.json` 路径生成，禁止页面内重复造轮子。
7. 两分辨率截图 + 弱网/错误态 + 幂等回归后才可关闭 Issue #3。

## 仓库门禁

根目录执行：

```powershell
npm run cocos:contracts:check
```

该命令验证 46/46 Screen、41/41 Component、唯一 route 与生成映射 freshness。


## 代码侧 Runtime / Story / Board / Art

- `RuntimeConfigRepository`：加载 110 日 / 651 Order 正式 Runtime。
- `DialogueRepository + DialoguePlayer`：按 10 日 slice 加载 268 Scene / 821 条本地化对白。
- `BoardModel + MergeRuleIndex`：63 格 Merge-2 域模型，规则来自正式 Runtime transformations。
- `AssetIdResolver`：389 个正式 AssetId 对应 Cocos resources 图片。
- `cocos:resources:check`：逐字节检查 Runtime/Story 镜像，并校验 389 PNG 的 SHA-256。

当前剩余必须由 Cocos Creator Editor / 真机产生的产物继续保持 `PENDING_EDITOR_GENERATION`，不得手写伪造。


## Editor 一键生成

Creator 3.8 项目扩展：`extensions/femsj-editor-bootstrap/`。

启用后使用 **Developer → FEMSJ → Generate V4 App Shell**，会在当前场景创建：

```text
Canvas
└─ SafeAreaRoot
   ├─ ScreenHost
   └─ ScreenTemplateStaging
      ├─ UI00
      ├─ ...
      └─ UI45
```

再使用 **Audit V4 App Shell** 校验 46 个 Screen ID。正式 Scene/Prefab 必须由 Creator Editor 保存/生成，之后更新 `production-data/v4/ui/cocos_editor_acceptance_v4.json`；`npm run cocos:editor:check` 会校验状态与真实文件是否一致。


## Screen Runtime Guards

- 页面状态：`ScreenViewStateController` 只允许进入对应 Screen Contract 声明的状态。
- 防重复点击：`IdempotentActionGate` 按 idempotency key 合并并发调用。
- 弱网重试：`NetworkPolicyRunner` 只对明确幂等操作执行 safe retry，并应用页面 timeout。
- `ScreenRouter` 每页创建独立 `ScreenRuntimeSession`，离开页面自动释放。
