# 《肥鹅美食街》Cocos 开发配置与技术实现 V3

> 目标：Cocos Creator 3.8 LTS + TypeScript + 微信小游戏优先。  
> 核心原则：**数据驱动、原子命令、可模拟、可回滚、活动配置化、关键经济服务端权威。**

# 1. 工程结构

```text
assets/
├─ bundles/
│  ├─ core/
│  ├─ street_01/
│  ├─ street_02/
│  ├─ story/
│  ├─ items_01/
│  └─ events/
├─ scripts/
│  ├─ app/
│  ├─ domain/
│  ├─ board/
│  ├─ producer/
│  ├─ cooking/
│  ├─ order/
│  ├─ progression/
│  ├─ street/
│  ├─ story/
│  ├─ economy/
│  ├─ event/
│  ├─ album/
│  ├─ monetization/
│  ├─ save/
│  ├─ net/
│  ├─ telemetry/
│  └─ ui/
└─ config/
```

# 2. Domain Model

```ts
type EntityId = string;

interface ItemInstance {
  instanceId: EntityId;
  itemId: string;
  createdAt: number;
  flags: number;
}

interface BoardCell {
  index: number;
  state: "OPEN"|"LOCKED"|"BLOCKED";
  itemInstanceId?: EntityId;
}

interface PlayerState {
  playerId: string;
  day: number;
  wallet: WalletState;
  board: BoardState;
  storage: StorageState;
  producers: ProducerRuntime[];
  cookwares: CookwareRuntime[];
  orders: OrderRuntime[];
  progression: ProgressState;
  events: Record<string, EventRuntime>;
}
```

# 3. Transformation Graph

不要只有 `mergeTo`。

```ts
type TransformType = "MERGE2"|"COOK"|"OPEN"|"EXCHANGE";

interface Transformation {
  id: string;
  type: TransformType;
  inputs: Requirement[];
  toolId?: string;
  durationSec?: number;
  outputs: RewardItem[];
}
```

这样同一个肉类节点既能继续二合，也能进入烤架。

# 4. Producer

```ts
interface ProducerConfig {
  id: string;
  level: number;
  energyCost: number;
  capacity: number;
  cooldownSec: number;
  outputPool: WeightedItem[];
  upgradeTo?: string;
  tags: string[];
}
```

Runtime：
```ts
interface ProducerRuntime {
  instanceId: string;
  configId: string;
  remainingCapacity: number;
  cooldownEndAt: number;
  modifiers: RuntimeModifier[];
}
```

# 5. Cookware

```ts
interface CookwareRuntime {
  instanceId: string;
  cookwareId: string;
  state: "IDLE"|"COOKING"|"READY";
  recipeId?: string;
  finishAt?: number;
}
```

服务端时间为关键倒计时权威。

# 6. Command Bus

所有玩家操作通过命令：

```text
MoveItem
MergeItems
ProducerTap
StartCooking
CollectCooking
SubmitOrder
MoveToStorage
MoveFromStorage
OpenContainer
ClaimReward
BuildNode
BuyShopItem
WatchAdClaim
PurchaseClaim
```

Command 流程：

```text
Validate
→ Execute
→ DomainEvents
→ Persist
→ UI Projection
```

UI 永远不能直接 `wallet.gem -= 10`。

# 7. 不变量

- 一个 InstanceId 只在一个容器中；
- Merge 两进一出；
- 满盘 ProducerTap 不扣体力；
- 0体力不生成；
- 冷却中不生成；
- SubmitOrder 全有或全无；
- ClaimReward 幂等；
- Purchase 回调幂等；
- 活动结算幂等；
- Cook完成只可领取一次；
- Save版本迁移可回滚。

# 8. Save

推荐：
```text
Snapshot + EventJournal
```

Snapshot：
```json
{
  "schemaVersion": 12,
  "revision": 18421,
  "serverTime": 0,
  "player": {},
  "board": {},
  "storage": {},
  "producers": [],
  "cookwares": [],
  "orders": [],
  "progression": {},
  "events": {}
}
```

每 N 个命令或关键经济操作后快照。

# 9. 云同步

```text
ClientRevision
ServerRevision
```

冲突策略：
- 关键货币永远服务器赢；
- 棋盘可用操作事件重放；
- 发现双端同时活跃→提示选择设备/自动合并不可取时锁写；
- 不按渠道 openId 分裂存档。

# 10. 配置表

必需：
```text
item.json
transformation.json
producer.json
cookware.json
recipe.json
order.json
day.json
build.json
story.json
economy.json
shop.json
event.json
album.json
offer.json
```

每个配置：
- `id`
- `version`
- `enabled`
- `validFrom/validTo`（运营类）
- `tags`
- `comment`

# 11. Day Config

```json
{
  "id": "day_075",
  "day": 75,
  "orderSequence": ["ord_075_01","ord_075_02"],
  "parallelSlots": 3,
  "unlocks": [],
  "buildNodes": [],
  "storyBefore": null,
  "storyAfter": null,
  "reward": {}
}
```

# 12. Order Config

```json
{
  "id": "ord_x",
  "requirements": [
    {"itemId":"dish_x","count":1}
  ],
  "rewards": [
    {"type":"COIN","amount":100}
  ],
  "customerId":"goose_001",
  "difficultyBudget": {
    "energyP50":100,
    "energyP90":140,
    "cookWaitSec":600,
    "peakCells":18
  }
}
```

# 13. Event Framework

```ts
interface EventDefinition {
  id: string;
  startAt: number;
  endAt: number;
  unlock: Condition[];
  progressSources: ProgressSource[];
  milestones: Milestone[];
  modifiers: Modifier[];
  ranking?: RankingConfig;
  offers?: string[];
  settlement: SettlementRule;
}
```

ProgressSource：
```text
PRODUCER_TAP
ITEM_SPAWN
ITEM_MERGE
COOK_START
COOK_COMPLETE
ORDER_COMPLETE
DAY_COMPLETE
BUILD_COMPLETE
ENERGY_SPEND
AD_REWARD
PURCHASE
```

Modifier：
```text
PRODUCER_UNLIMITED
PRODUCER_CAPACITY_MULTIPLIER
COOK_SPEED_MULTIPLIER
DROP_WEIGHT_OVERRIDE
REWARD_MULTIPLIER
```

# 14. Balance Simulator

必须做独立 Node/Python 工具，不依赖 Cocos 场景。

输入：
- Producer掉率；
- Merge图；
- Recipe；
- Order；
- Day；
- 体力规则；
- 玩家策略。

每 Day 10,000 Monte Carlo。

输出：
```text
Energy P50/P75/P90/P95
CompletionTime
ProducerCooldownCount
CookWait
PeakCells
BoardFullProbability
ByproductDiscardRate
SessionCount
```

# 15. Config Validator

CI 自动检查：
- 引用ID存在；
- Transformation 无死循环；
- Item不可达；
- Day引用有效Order；
- Recipe输入可获得；
- 活动时间有效；
- 奖励不为负；
- P90预算不过线；
- 普通订单无“三堵墙”。

# 16. UI架构

建议：
```text
View
Presenter/ViewModel
ApplicationService
Domain
```

UI只订阅 Projection，不直接访问 Domain 内部可变结构。

# 17. 资源管理

Cocos Asset Bundle：
- 首包只放启动/教学；
- 经营区域远程 Bundle；
- 活动独立 Bundle；
- 赛季卡册独立 Bundle；
- Bundle 版本由远程 manifest 管理。

# 18. 微信小游戏

关键：
- SafeArea；
- 胶囊按钮区域；
- 登录授权；
- 分享/广告；
- 支付能力；
- 分包/远程资源；
- 前后台切换恢复 Timer；
- 弱网和进程被杀恢复。

不要假设小游戏会一直在内存里。

# 19. 服务端

轻量服务足够：

```text
Auth
Profile/Save
Economy
LiveOps
Payment
AdVerify
Ranking
Analytics
```

关键经济服务端权威：
- Gem；
- IAP；
- AdReward；
- Album Pack RNG；
- Event Ranking；
- Limited Offer；
- Major Reward Claim。

# 20. 反作弊

重点：
- 本机改时间；
- 广告回调重放；
- 支付回调重放；
- 活动领奖重放；
- 卡包结果篡改；
- 改本地Gem；
- 重复提交订单。

措施：
- ServerTime；
- nonce/idempotencyKey；
- signed receipt；
- reward ledger；
- economy audit log。

# 21. 埋点

```text
tutorial_step
producer_tap
producer_blocked
merge
board_full
cook_start
cook_complete
order_complete
energy_zero
energy_refill
ad_start/ad_complete
offer_show/offer_buy
day_start/day_complete
build_complete
event_enter/event_complete
album_pack_open
album_duplicate
```

维度：
- day；
- session；
- channel；
- appVersion；
- configVersion；
- payerSegment；
- eventId。

# 22. 性能预算

目标：
- 中端机稳定 60fps；
- 低端机 ≥30fps；
- Board 同屏节点≤250；
- 同屏 Spine≤8个高规格；
- 粒子并发≤12组；
- 单帧 JS 主线程尽量 <8ms；
- 资源切换无 >300ms 主线程卡顿。

# 23. 测试矩阵

### Board
- 10000 次随机 Move/Merge；
- 无重复InstanceId；
- 强杀恢复；
- 满盘ProducerTap；
- Merge期间切后台。

### Economy
- 重复领奖100次；
- 支付回调重复10次；
- 广告回调重复10次；
- 跨设备同时请求。

### Timer
- 改系统时间；
- 前后台24h；
- 时区变化；
- 夏令时；
- 离线重进。

### LiveOps
- 活动开始边界；
- 活动结束边界；
- 结束瞬间Submit；
- 过期奖励自动补发；
- 配置回滚。

# 24. AI/Codex 开发顺序

P0：
```text
Domain + Config + Board + CommandBus + Save
```

P1：
```text
Producer + Merge + Storage
```

P2：
```text
Cookware + Recipe + Order
```

P3：
```text
Day + Build + Story
```

P4：
```text
Economy + Shop + Ads
```

P5：
```text
Event Framework + Album
```

P6：
```text
Art integration + Optimization + LiveOps
```

第一验收版只需要灰盒：
```text
生产→合成→烹饪→交单→奖励→存档→重启恢复
```

# 25. PR门禁

任何改动必须：
- 单测；
- Config Validator；
- Save migration；
- Deterministic replay；
- Economy ledger 检查；
- 关键操作日志；
- 断网重试；
- UI状态截图测试（可选自动）。

未通过不得合并。