# Windows / Cocos Creator 3.8 最短验收执行单

目标只处理 Issue #3 仍需真实 Creator Editor / 真机产生的证据。禁止手写或伪造 `.scene/.prefab/.meta/.pac`、截图和设备结果。

## 0. 开始前

在仓库根目录确认最新 `main`，然后先跑仓库侧门禁：

```powershell
npm run cocos:contracts:check
npm run cocos:resources:check
npm run cocos:atlas:check
npm run cocos:editor:check
npm run cocos:editor:progress
```

设置 Creator 3.8 可执行文件并打开项目：

```powershell
$env:COCOS_CREATOR_EXE = "<你的 Cocos Creator 3.8.x 可执行文件完整路径>"
powershell -ExecutionPolicy Bypass -File .\tools\cocos-editor-runner\open-editor.ps1
```

## 1. 先生成 App.scene 和 46 个真实 Prefab

1. Creator 中创建/打开一个空场景。
2. 执行 `Developer -> FEMSJ -> Generate V4 App Shell`。
3. 执行 `Developer -> FEMSJ -> Audit V4 App Shell`，必须返回 PASS；`inactiveScreenTemplates` 必须为空。
4. 用 Creator 保存场景为 `client-cocos/assets/App.scene`。
5. 在 Creator 中将 `ScreenTemplateStaging` 下的 UI00–UI45 节点逐个通过官方 Prefab 工作流生成到：
   `client-cocos/assets/resources/ui/screens/UI00.prefab` … `UI45.prefab`。
6. 不要手写 `.prefab` 或 `.meta`；让 Creator 自己生成和导入。

建议按 6 批完成：
- 批 1：UI00–UI07
- 批 2：UI08–UI15
- 批 3：UI16–UI23
- 批 4：UI24–UI31
- 批 5：UI32–UI39
- 批 6：UI40–UI45

每批完成后回到仓库根目录执行：

```powershell
npm run cocos:editor:sync
npm run cocos:editor:check
npm run cocos:editor:progress
```

此阶段最终应显示：App.scene READY、Prefabs 46/46。

## 2. 只给 5 个非空组创建 Auto Atlas

只在以下 5 个目录用 Creator 的 `Create -> Auto Atlas` 创建真实 `auto-atlas.pac`：

| 组 | Sprite 数 | 目录 |
| --- | ---: | --- |
| album | 1 | `client-cocos/assets/resources/art/album/atlas/` |
| core | 18 | `client-cocos/assets/resources/art/core/atlas/` |
| items_01 | 49 | `client-cocos/assets/resources/art/items_01/atlas/` |
| items_04 | 93 | `client-cocos/assets/resources/art/items_04/atlas/` |
| story | 52 | `client-cocos/assets/resources/art/story/atlas/` |

`street`、`street_01`、`street_02`、`street_03`、`street_04` 当前均为 `NOT_REQUIRED`，不要创建空 Atlas。

5 个 `.pac` 均由 Creator 生成后执行：

```powershell
npm run cocos:atlas:build
npm run cocos:atlas:check
npm run cocos:editor:progress
```

最终应显示 Auto Atlas 5/5。

## 3. 按页面批量落 92 张真实截图 + 46 份状态回归

每个 UIxx 固定落盘：

```text
client-cocos/acceptance/screens/UIxx/
  750x1334.png
  750x1624.png
  state-regression.json
```

要求：
- 两张 PNG 必须是实际渲染截图，且像素尺寸必须分别为 750×1334、750×1624；检查脚本会读取 PNG IHDR 验证真实尺寸，不再只看文件名。
- `state-regression.json` 必须来自实际状态回归，至少包含 `result`、`testedAt`、`states`、`notes`。
- 不要复制占位图，不要用空壳 `PASS`。

继续沿用上面的 6 个 UI 批次；每批一次完成两张截图和状态回归。每批完成后执行：

```powershell
npm run cocos:editor:sync
npm run cocos:editor:check
npm run cocos:editor:progress
```

最终应显示：
- Screenshots 750x1334：46/46
- Screenshots 750x1624：46/46
- State regressions：46/46

## 4. 最后做 5 项真实设备验收

固定文件：

```text
client-cocos/acceptance/device/safe-area.json
client-cocos/acceptance/device/weak-network-recovery.json
client-cocos/acceptance/device/idempotent-repeated-tap.json
client-cocos/acceptance/device/performance.json
client-cocos/acceptance/device/wechat-mini-game-build.json
```

每份 JSON 必须来自真实测试，至少包含：

```json
{
  "result": "PASS",
  "testedAt": "2026-09-26T12:00:00+08:00",
  "device": "真实设备/型号",
  "build": "真实构建标识",
  "notes": "实际测试结果和关键测量信息"
}
```

建议每完成 1 项立即执行：

```powershell
npm run cocos:editor:sync
npm run cocos:editor:check
npm run cocos:editor:progress
```

只有真实失败结果时写 `FAIL`，不要为了关 Issue 改成 PASS。

## 5. 最终关单前

执行：

```powershell
npm run cocos:editor:sync
npm run cocos:atlas:build
npm run cocos:editor:check
npm run cocos:atlas:check
npm run cocos:contracts:check
npm run cocos:resources:check
npm run cocos:editor:evidence:test
npm run cocos:editor:progress
```

最终 `cocos:editor:progress` 应至少显示：
- App.scene：READY
- Prefabs：46/46
- 750×1334：46/46
- 750×1624：46/46
- State regressions：46/46
- Real-device evidence：5/5
- Auto Atlas：5/5

然后提交真实 Editor/验收产物走 PR；V4 Quality Gates 全绿后，Issue #3 才满足关闭条件。
