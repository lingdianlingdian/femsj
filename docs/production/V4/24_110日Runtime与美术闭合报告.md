# V4 110日 Runtime + Art Closure

更新时间：2026-09-25

## 结论

V4 已形成一份可通过 Schema、引用闭合、全周期可达性与美术绑定门禁的 **Day1-110 可执行 Runtime**。

这不等于已经复原竞品后台数值。

研究层与开发层仍严格分离：

- 113 个 Order：requirements 有公开证据支持。
- 538 个 Order：公开菜单尚未完整转录，使用 `DEV_BLUEPRINT` 原创 requirements 使本项目 Runtime 可执行。
- Producer / Cookware / Recipe 无公开精确参数的字段继续属于原创运行默认值。
- P0-A / P0-B 仍用于提高“竞品研究精度”，不会反向改写原创事实边界。

## Runtime 主文件

- `production-data/v4/runtime/game_content_day001_110.json`
- `production-data/v4/runtime/game_content_day001_110_report.json`
- Builder：`tools/runtime-full-builder/build.mjs`
- 自动生成：`.github/workflows/v4-runtime-generate.yml`

### 当前规模

| 模块 | 数量 |
|---|---:|
| Items | 143 |
| Transformations | 8 |
| Producers | 14 |
| Cookwares | 5 |
| Recipes | 52 |
| Orders | 651 |
| Days | 110 |
| Build Nodes | 48 |
| LiveOps Events | 6 |
| Evidence-backed Order Requirements | 113 |
| DEV_BLUEPRINT Orders | 538 |

### Closure

- Missing Item Assets：0
- Reference Errors：0
- Order Registry Match：true
- Day Coverage：110/110
- Story Hook Coverage：true
- Build Coverage：48/48
- Config Validator：PASS
- Deterministic Builder Freshness：PASS

## 全周期 Balance

### Sampling Gate

Day30 / 60 / 90 / 110 均进入固定 Seed 回归。

### 110日 Reachability Gate

```powershell
npm run gate:balance:full-reachability
```

当前结果：

- Day Count：110
- Resolved Days：110 / 110
- 每日 Monte Carlo：100 runs
- Unresolved Days：0
- Unresolved Items：0

全周期当前峰值：

- Energy P90：约 357.9
- Wait P90：约 3260 秒
- PeakCells P90：16
- ManualActions P90：约 378.9

这些数值是原创 Runtime 调试基线，不是竞品后台参数。

### Trend Gate

```powershell
npm run gate:balance:full
```

当前固定检查 Day30 / 60 / 90 / 110，防止后期难度回归失控。

## Art Closure

### Formal Assets

- Asset Manifest：389
- Formal Binary Outputs：389
- APPROVED：389 / 389
- Style Anchors：14 / 14 CANON_LOCKED

### Full Runtime Binding

主文件：

`production-data/v4/art/runtime_art_bindings_day001_110_v4.json`

覆盖：

| Binding | 数量 |
|---|---:|
| Items | 143 |
| Producers | 14 |
| Cookwares | 5 |
| Characters | 26 |
| Build Nodes | 48 |
| Unique bound AssetIds | 382 |

所有绑定引用：

- AssetId 存在；
- Asset Manifest 状态为 APPROVED / INTEGRATED；
- Binary Output 存在；
- Output 状态为 APPROVED / INTEGRATED；
- SHA-256 有效。

门禁：

```powershell
npm run audit:art:runtime-full
```

## Story Closure

- Day1-110
- 11 Story Slices
- 268 Scenes
- 821 zh-CN original lines
- 220 Day Entry/Exit
- 48 Build Scenes
- 48/48 Build Story Trigger closed

门禁：

```powershell
npm run validate:story:all
```

## 仍未完成

### 竞品 Evidence

P0-A：
- 未转录公开菜单继续文字化。

P0-B：
- Producer exact weight / capacity / cooldown / high-tier drop rate。
- Recipe/Cookware exact duration / speedup / queue / modifier。

这些不会阻断原创 Runtime 执行，但会影响竞品研究精度。

### Engine Integration

目前仓库仍没有正式 Cocos Creator 客户端工程。

因此尚未完成：

- Cocos Scene / Prefab；
- Runtime Loader；
- Merge-2 Board；
- Producer / Cookware Runtime Components；
- Order UI；
- Dialogue Player；
- Asset Bundle / Atlas 实际绑定；
- 微信小游戏构建；
- 真机截图与性能 QA。

这应当成为下一阶段主线。
