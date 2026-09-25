# Balance Simulator V2 · Monte Carlo

运行：

```powershell
node tools/balance-simulator/simulate.mjs production-data/v4/runtime/game_content_day001_110.json
node tools/balance-simulator/simulate.mjs production-data/v4/runtime/game_content_day001_110.json 80 10000 20260925
```

参数：
1. 配置文件
2. 可选 Day
3. 可选 runs，默认10000
4. 可选随机种子

## 输出

每个 Day：
- Energy：mean / P50 / P75 / P90 / P95 / max
- Wait：mean / P50 / P75 / P90 / P95
- PeakCells proxy
- ManualActions
- unresolvedItems

## 已模拟

- Producer weighted output → 随机采样
- energyCost
- capacity
- cooldownSec
- Merge / Transformation inputs
- Recipe inputs
- durationSec
- Order requirements

## 故意不伪造

如果：
- Producer weight未知
- capacity未知
- cooldown未知
- Recipe duration未知
- Item不可达

则该依赖返回 `UNRESOLVED`，不会用一个“合理默认值”把它跑通。

## 当前限制

V2仍未模拟：
- 同一Producer副产物跨订单复用
- 实际63格逐步Board状态
- 仓库策略
- 玩家主动保留中间物
- 活动Modifier的全部组合

因此 PeakCells 目前是依赖压力代理值。

## V3 Simulator 目标

- 真正Board-state Monte Carlo
- 副产物共享
- Storage策略
- 玩家策略模板（Casual / Optimized / Whale）
- P(full board)
- Byproduct utilization
- Session count / offline wait
