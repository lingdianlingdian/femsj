# Balance Simulator V3 · Board-State Monte Carlo

更新时间：2026-09-25

## 目的

V2 只能估算 Energy / Wait / PeakCells proxy。V3 将模拟推进到真实盘面状态层，用于发现：

- 63 格盘面的空间压力；
- Producer 副产物跨订单复用；
- Storage 占用与搬运；
- P(full board)；
- P(hard blocked)；
- 压力清杂次数；
- 副产物利用率；
- Session Count；
- 残余盘面与仓库占用。

## 运行

```powershell
npm run simulate:balance:v3 -- production-data/v4/runtime/game_content_day001_010.json 10 2000 20260925 OPTIMIZED
```

参数：

1. Runtime Config
2. 可选 Day
3. runs
4. seed
5. Strategy：`CASUAL | OPTIMIZED | WHALE`

> Strategy 是原创开发模拟模板，不代表竞品真实用户行为或商业化后台。

## 玩家策略模板

### CASUAL

- 63 Board Cells
- 8 Storage
- 接近满盘才处理
- 不主动清杂
- 不主动压缩盘面

用于模拟低管理强度玩家。

### OPTIMIZED

- 63 Board Cells
- 8 Storage
- 82% 压力线开始整理
- 自动利用安全 Merge 压缩
- 主动使用 Storage
- 仅在空间压力下清除“剩余订单需求=0”的副产物
- 清杂不计金币收益

这是当前 Day1-10 Vertical Slice 的默认回归策略。

### WHALE

- 63 Board Cells
- 16 Storage
- 开发模拟中等待乘数 0.5
- 同样允许压力清杂

仅用于压力敏感性测试，不代表任何竞品付费效果。

## V3 状态模型

每个 Monte Carlo Run 都维护：

- `board: Map<ItemId, Count>`
- `storage: Map<ItemId, Count>`
- 每个 Producer 剩余 Capacity
- Producer Cooldown
- 副产物 Credit
- 当日剩余订单需求
- Manual Actions
- Wait Seconds
- Session Breaks
- Peak Board / Storage

### Producer

每次点击：

1. 按 OutputPool Weight 真随机抽取；
2. 扣 Energy；
3. 扣 Capacity；
4. 产物进入 Board；
5. 非当前目标产物记为 Byproduct；
6. Capacity 耗尽后累计 Cooldown。

### Recipe / Transformation

1. 递归获取输入；
2. 消耗输入；
3. 增加 Duration；
4. 生成 Output；
5. Output 进入真实 Board。

### 跨订单副产物复用

Producer 产出的非目标 Item 不会像 V2 一样丢弃。

后续订单、Recipe 或 Merge 消耗到这些 Item 时，计入：

- `byproductReused`
- `byproductUtilization`

## Board Pressure

### Storage

当 Board 达到策略压力线时，可以把物品移动到 Storage。

### Merge Compaction

如果满足安全条件，可通过已知 MERGE2 关系把多个低阶 Item 压成高阶 Item。

### Pressure Clear

OPTIMIZED / WHALE 在 Board + Storage 压力过高时，可以清除：

- 当前订单不保护；
- 剩余订单需求为 0；
- 明确属于 Producer 副产物的 Item。

清除不计算 Coin，避免把“清盘”同时当作经济收益。

## 输出

每个 Day 输出：

- Energy：mean / P50 / P75 / P90 / P95 / max
- WaitSec
- PeakBoardCells
- PeakStorageCells
- ManualActions
- SessionCount
- ByproductUtilization
- ByproductCleared
- StorageMoves
- MergeCompactions
- PressureClears
- ResidualBoard
- ResidualStorage
- P(full board)
- P(hard blocked)
- Blocked Reasons

## Day1-10 当前 OPTIMIZED 基线

固定 seed：`20260925`

### Day1

- P(hard blocked)：0
- P(full board)：0
- Energy P50：29
- Energy P90：46
- Wait P90：90s
- Peak Board P90：41
- Byproduct Utilization P50：0.25
- Pressure Clear P90：0

### Day10

- P(hard blocked)：0
- P(full board)：0
- Energy P50：76.5
- Energy P90：113
- Wait P50：450s
- Wait P90：630s
- Peak Board P90：52
- Peak Storage P90：8
- Byproduct Utilization P50：0.08
- Pressure Clear P90：30

## 当前结论

V3 证明 Day1-10 已经不是“引用不闭合”问题，而开始进入真正的体验平衡问题。

Day10 虽然已经不发生硬满盘，但仍需要较多压力清杂，说明当前原创 Producer OutputPool 偏宽。后续优化方向应优先是：

1. 缩窄 Producer Pool；
2. 增加合理 Merge Chain；
3. 提高跨订单/跨日副产物复用；
4. 再决定是否增加 Storage；
5. 不应单纯继续降低 Cooldown 来掩盖空间问题。

## CI 门禁

```powershell
npm run gate:balance:v3
```

阈值文件：

`production-data/v4/runtime/vertical_slice_board_targets.json`

当前会阻断：

- P(full board) 超阈值；
- P(hard blocked) 超阈值；
- Board / Storage P90 超阈值；
- Manual Actions P90 超阈值；
- Pressure Clears P90 超阈值；
- Byproduct Utilization P50 低于下限。

## 已知限制

V3 当前仍未模拟：

- 跨 Day 库存继承；
- Cookware 多队列并行调度；
- 真实拖拽路径时间；
- Bubble / Locked / Blocker Cell；
- 出售物品获得 Coin；
- 活动 Modifier 组合；
- 离线恢复期间 Producer/Cookware 并行；
- 玩家主动提前准备未来 Day 订单。

这些限制必须在解释结果时保留，不能把 V3 输出说成真实玩家耗时预测。
