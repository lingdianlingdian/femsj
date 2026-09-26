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

只有真实截图存在时，`cocos:editor:sync` 才会将对应分辨率状态提升为 PASS。

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
```

CI 会拒绝没有真实证据文件的 READY/PASS。
