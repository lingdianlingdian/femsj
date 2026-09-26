# Cocos Editor / Real Device Acceptance Evidence

此目录只存**实际执行结果**，不能用规划文档或占位文件冒充验收证据。

## Screen evidence

每页固定路径：

```text
screens/UI00/
  750x1334.png
  750x1624.png
  state-regression.json
...
screens/UI45/
```

`state-regression.json` 最小格式：

```json
{
  "result": "PASS",
  "testedAt": "YYYY-MM-DDTHH:mm:ss+08:00",
  "states": ["LOADING", "READY", "ERROR"],
  "notes": "actual Editor/device regression notes"
}
```

只有真实 PNG 存在且 IHDR 像素尺寸分别严格为 750×1334 / 750×1624 时，`cocos:editor:sync` 才会将对应分辨率状态提升为 PASS。

## Real-device evidence

固定文件：

- `device/safe-area.json`
- `device/weak-network-recovery.json`
- `device/idempotent-repeated-tap.json`
- `device/performance.json`
- `device/wechat-mini-game-build.json`

最小格式：

```json
{
  "result": "PASS",
  "testedAt": "YYYY-MM-DDTHH:mm:ss+08:00",
  "device": "actual device/model",
  "build": "actual build identifier",
  "notes": "measured result"
}
```

执行：

```powershell
npm run cocos:editor:sync
npm run cocos:editor:check
npm run cocos:editor:progress
```

- `cocos:editor:check` 会校验 PNG 真实尺寸，并校验状态回归 JSON 的 `result/testedAt/states/notes` 与真机 JSON 的 `result/testedAt/device/build/notes`。
- `cocos:editor:progress` 只读汇总 App.scene、46 Prefab、92 截图、46 状态回归、5 真机证据及 5 个必需 Auto Atlas 的当前进度，不生成任何验收证据。
- Windows / Creator 3.8 的最短执行顺序见 `WINDOWS-CREATOR-3.8-RUNBOOK.md`。

CI 会拒绝没有真实证据文件的 READY/PASS，也会拒绝错误尺寸 PNG 或结构不完整的 PASS JSON。
