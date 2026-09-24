# V4 46页逐页 UI Production Bible

> 基准：750×1334 逻辑画布；SafeArea 动态读取。  
> 本文是原创同类产品生产规格；公开截图用于确认信息架构，不声称坐标/色值等于原作内部设计文件。

## 全局规则

- 最小触控热区：88×88。
- 所有资源扣减、支付、广告领奖、里程碑领取都必须幂等。
- 所有服务端页至少有 LOADING / READY / ERROR；列表页再加 EMPTY；限时内容加 EXPIRED。
- 重要状态不能只靠颜色表达。
- 中文文案放大10%仍不得爆版。
- 750×1334、750×1624必须通过适配截图测试。
- Modal关闭回触发页，不得无理由跳主街。
- 线框原型：`prototype/v4-ui-wireframes/index.html`。


---

## UI00｜Boot/启动

**证据类型**：R　**Route**：`/boot`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI00_1`：Logo；最小热区 88px；显示条件：state-dependent。
- `UI00_2`：VersionLabel；最小热区 88px；显示条件：state-dependent。
- `UI00_3`：PatchProgress；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `ERROR`

### 页面特有规则

- 启动期间禁止出现付费/活动弹窗。
- 热更失败必须保留重试与错误码复制能力。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`BOOT_START`、`PATCH_COMPLETE`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI01｜账号登录/渠道授权

**证据类型**：R　**Route**：`/login`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI01_1`：GuestLogin；最小热区 88px；显示条件：state-dependent。
- `UI01_2`：WeChatLogin；最小热区 88px；显示条件：state-dependent。
- `UI01_3`：DouyinLogin；最小热区 88px；显示条件：state-dependent。
- `UI01_4`：PhoneLogin；最小热区 88px；显示条件：state-dependent。
- `UI01_5`：AppleLogin；最小热区 88px；显示条件：state-dependent。
- `UI01_6`：Agreement；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 授权拒绝后仍可回到登录页。
- 账号绑定冲突不得静默覆盖云存档。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`LOGIN_SHOW`、`LOGIN_SUCCESS`、`LOGIN_FAIL`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI02｜资源更新

**证据类型**：R　**Route**：`/patch`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI02_1`：PatchProgress；最小热区 88px；显示条件：state-dependent。
- `UI02_2`：RemainSize；最小热区 88px；显示条件：state-dependent。
- `UI02_3`：RetryButton；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 下载中切后台可恢复。
- 空间不足单独错误态。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`PATCH_SHOW`、`PATCH_RETRY`、`PATCH_FAIL`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI03｜开场剧情

**证据类型**：E　**Route**：`/story/opening`　**表现**：fullScreen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI03_1`：CharacterPortrait；最小热区 88px；显示条件：state-dependent。
- `UI03_2`：Nameplate；最小热区 88px；显示条件：state-dependent。
- `UI03_3`：Dialogue；最小热区 88px；显示条件：state-dependent。
- `UI03_4`：Skip；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `ERROR`

### 页面特有规则

- 跳过仅跳过表现，不跳过必要状态初始化。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`STORY_START`、`STORY_SKIP`、`STORY_COMPLETE`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI04｜4×7教学棋盘

**证据类型**：E　**Route**：`/tutorial/board`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 850 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI04_1`：Board4x7；最小热区 88px；显示条件：state-dependent。
- `UI04_2`：GuideHand；最小热区 88px；显示条件：state-dependent。
- `UI04_3`：OrderCard；最小热区 88px；显示条件：state-dependent。
- `UI04_4`：Producer；最小热区 88px；显示条件：state-dependent。
- `UI04_5`：TutorialMask；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `ERROR`

### 页面特有规则

- 每一步只开放预期输入。
- 中断后从最近幂等步骤恢复。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`TUTORIAL_STEP`、`TUTORIAL_COMPLETE`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI05｜9×7合成主盘

**证据类型**：E　**Route**：`/board`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 850 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI05_1`：ResourceBar；最小热区 88px；显示条件：state-dependent。
- `UI05_2`：OrderCarousel；最小热区 88px；显示条件：state-dependent。
- `UI05_3`：Board9x7；最小热区 88px；显示条件：state-dependent。
- `UI05_4`：UtilityBar；最小热区 88px；显示条件：state-dependent。
- `UI05_5`：EventDock；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 订单横条与棋盘同时可操作。
- 满盘不扣体力。
- 长按Producer为原创改良项。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`BOARD_ENTER`、`PRODUCER_TAP`、`ITEM_MERGE`、`BOARD_FULL`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI06｜订单详情

**证据类型**：R　**Route**：`/board/order/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI06_1`：Customer；最小热区 88px；显示条件：state-dependent。
- `UI06_2`：Requirements；最小热区 88px；显示条件：state-dependent。
- `UI06_3`：Reward；最小热区 88px；显示条件：state-dependent。
- `UI06_4`：SourceHint；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 需求物可点击跳转来源。
- 拥有数量必须实时更新。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`ORDER_DETAIL_SHOW`、`ORDER_SOURCE_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI07｜物品详情

**证据类型**：R　**Route**：`/board/item/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI07_1`：Icon；最小热区 88px；显示条件：state-dependent。
- `UI07_2`：Name；最小热区 88px；显示条件：state-dependent。
- `UI07_3`：Level；最小热区 88px；显示条件：state-dependent。
- `UI07_4`：Source；最小热区 88px；显示条件：state-dependent。
- `UI07_5`：Uses；最小热区 88px；显示条件：state-dependent。
- `UI07_6`：SellButton；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 出售高阶/稀有物必须二次确认。
- 显示来源与用途避免误卖。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`ITEM_DETAIL_SHOW`、`ITEM_SELL`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI08｜合成链图鉴

**证据类型**：R　**Route**：`/album/items/:chain`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI08_1`：ChainGraph；最小热区 88px；显示条件：state-dependent。
- `UI08_2`：LockedNode；最小热区 88px；显示条件：state-dependent。
- `UI08_3`：SourceProducer；最小热区 88px；显示条件：state-dependent。
- `UI08_4`：UseRecipes；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 未解锁节点可见轮廓但不暴露不应提前公开的信息。
- 链图允许定位生产器/菜谱。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`CHAIN_SHOW`、`CHAIN_NODE_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI09｜发射器详情

**证据类型**：R　**Route**：`/board/producer/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI09_1`：ProducerArt；最小热区 88px；显示条件：state-dependent。
- `UI09_2`：Capacity；最小热区 88px；显示条件：state-dependent。
- `UI09_3`：Cooldown；最小热区 88px；显示条件：state-dependent。
- `UI09_4`：OutputTags；最小热区 88px；显示条件：state-dependent。
- `UI09_5`：UpgradeHint；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 冷却必须显示绝对剩余时间。
- 掉率若不公开则显示产出类别而非伪概率。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`PRODUCER_DETAIL_SHOW`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI10｜厨具加工面板

**证据类型**：E/R　**Route**：`/board/cookware/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI10_1`：InputSlots；最小热区 88px；显示条件：state-dependent。
- `UI10_2`：RecipeList；最小热区 88px；显示条件：state-dependent。
- `UI10_3`：Timer；最小热区 88px；显示条件：state-dependent。
- `UI10_4`：Start；最小热区 88px；显示条件：state-dependent。
- `UI10_5`：SpeedUp；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- COOKING状态锁定输入槽。
- READY必须可一键领取。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`COOK_PANEL_SHOW`、`COOK_START`、`COOK_SPEEDUP`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI11｜菜谱图鉴

**证据类型**：E/R　**Route**：`/recipes`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI11_1`：CategoryTabs；最小热区 88px；显示条件：state-dependent。
- `UI11_2`：RecipeGrid；最小热区 88px；显示条件：state-dependent。
- `UI11_3`：MaterialList；最小热区 88px；显示条件：state-dependent。
- `UI11_4`：CookwareTag；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 菜谱支持已解锁/未解锁过滤。
- 点击材料可回链图。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`RECIPE_BOOK_SHOW`、`RECIPE_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI12｜仓库/储物柜

**证据类型**：E/R　**Route**：`/storage`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI12_1`：StorageGrid；最小热区 88px；显示条件：state-dependent。
- `UI12_2`：BoardPreview；最小热区 88px；显示条件：state-dependent。
- `UI12_3`：ExpandButton；最小热区 88px；显示条件：state-dependent。
- `UI12_4`：GemPrice；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 扩容价格购买前后都显示。
- 拖出仓库失败需原位回滚。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`STORAGE_SHOW`、`STORAGE_EXPAND`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI13｜体力补充

**证据类型**：E/R　**Route**：`/energy`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI13_1`：CurrentEnergy；最小热区 88px；显示条件：state-dependent。
- `UI13_2`：RegenTimer；最小热区 88px；显示条件：state-dependent。
- `UI13_3`：AdRefill；最小热区 88px；显示条件：state-dependent。
- `UI13_4`：GemRefill；最小热区 88px；显示条件：state-dependent。
- `UI13_5`：Offer；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 自然恢复、广告、钻石、礼包四种来源分区。
- 广告次数是远程配置。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`ENERGY_PANEL_SHOW`、`ENERGY_REFILL`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI14｜主街/美食街

**证据类型**：E　**Route**：`/street`　**表现**：fullScreen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI14_1`：StreetWorld；最小热区 88px；显示条件：state-dependent。
- `UI14_2`：BuildHotspots；最小热区 88px；显示条件：state-dependent。
- `UI14_3`：NPC；最小热区 88px；显示条件：state-dependent。
- `UI14_4`：ActivityDock；最小热区 88px；显示条件：state-dependent。
- `UI14_5`：EnterBoard；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 主街只承载可视化进度，不做复杂经营寻路。
- 场景拖动与热点点击冲突需手势阈值。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`STREET_ENTER`、`BUILD_HOTSPOT_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI15｜建设节点详情

**证据类型**：E/R　**Route**：`/build/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI15_1`：BeforeAfter；最小热区 88px；显示条件：state-dependent。
- `UI15_2`：Cost；最小热区 88px；显示条件：state-dependent。
- `UI15_3`：Reward；最小热区 88px；显示条件：state-dependent。
- `UI15_4`：BuildButton；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 金币不足时不直接拉充值，先展示免费来源。
- 建造前显示视觉变化预览。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`BUILD_DETAIL_SHOW`、`BUILD_START`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI16｜建设完成

**证据类型**：R　**Route**：`/build/:id/complete`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI16_1`：BuildingReveal；最小热区 88px；显示条件：state-dependent。
- `UI16_2`：Reward；最小热区 88px；显示条件：state-dependent。
- `UI16_3`：NextNode；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 奖励飞入后再关闭。
- 若触发剧情，剧情入口优先级高于下一建设点。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`BUILD_COMPLETE_SHOW`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI17｜剧情对白

**证据类型**：E　**Route**：`/story/:id`　**表现**：fullScreen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI17_1`：Portrait；最小热区 88px；显示条件：state-dependent。
- `UI17_2`：Nameplate；最小热区 88px；显示条件：state-dependent。
- `UI17_3`：Dialogue；最小热区 88px；显示条件：state-dependent。
- `UI17_4`：Continue；最小热区 88px；显示条件：state-dependent。
- `UI17_5`：Skip；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `ERROR`

### 页面特有规则

- 对白支持快速点击但防双步。
- 重要剧情允许回看。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`STORY_BEAT`、`STORY_COMPLETE`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI18｜经营日完成

**证据类型**：R　**Route**：`/day/:id/complete`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI18_1`：DayBadge；最小热区 88px；显示条件：state-dependent。
- `UI18_2`：Rewards；最小热区 88px；显示条件：state-dependent。
- `UI18_3`：Unlocks；最小热区 88px；显示条件：state-dependent。
- `UI18_4`：BuildProgress；最小热区 88px；显示条件：state-dependent。
- `UI18_5`：NextDay；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 日奖励与建设进度拆开展示。
- Next Day前保证存档提交完成。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`DAY_COMPLETE_SHOW`、`DAY_REWARD_CLAIM`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI19｜新内容解锁

**证据类型**：R　**Route**：`/unlock/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI19_1`：NewIcon；最小热区 88px；显示条件：state-dependent。
- `UI19_2`：Name；最小热区 88px；显示条件：state-dependent。
- `UI19_3`：Description；最小热区 88px；显示条件：state-dependent。
- `UI19_4`：GoButton；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 解锁内容的去看看必须指向真实可用页面。
- 批量解锁时支持队列。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`UNLOCK_SHOW`、`UNLOCK_GO`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI20｜商店首页

**证据类型**：E　**Route**：`/shop`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI20_1`：ProductGrid；最小热区 88px；显示条件：state-dependent。
- `UI20_2`：PurchaseLimit；最小热区 88px；显示条件：state-dependent。
- `UI20_3`：RefreshTimer；最小热区 88px；显示条件：state-dependent。
- `UI20_4`：RefreshButton；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 商品售罄态明确。
- 刷新前二次确认钻石消耗。
- 刷新倒计时服务端校准。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`SHOP_SHOW`、`SHOP_BUY`、`SHOP_REFRESH`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI21｜钻石充值

**证据类型**：E　**Route**：`/iap/gems`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI21_1`：SkuCards；最小热区 88px；显示条件：state-dependent。
- `UI21_2`：Bonus；最小热区 88px；显示条件：state-dependent。
- `UI21_3`：Price；最小热区 88px；显示条件：state-dependent。
- `UI21_4`：Restore；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 平台价格以SDK返回为准。
- 支付中禁止重复下单。
- 支持补单/恢复购买。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`IAP_SHOW`、`IAP_START`、`IAP_RESULT`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI22｜限时礼包

**证据类型**：E　**Route**：`/offer/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI22_1`：Countdown；最小热区 88px；显示条件：state-dependent。
- `UI22_2`：Contents；最小热区 88px；显示条件：state-dependent。
- `UI22_3`：Price；最小热区 88px；显示条件：state-dependent。
- `UI22_4`：Close；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 用户关闭后同一会话不重复强弹。
- 倒计时结束立即禁用购买。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`OFFER_SHOW`、`OFFER_BUY`、`OFFER_CLOSE`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI23｜升级礼包

**证据类型**：E　**Route**：`/offer/level/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI23_1`：Milestone；最小热区 88px；显示条件：state-dependent。
- `UI23_2`：Contents；最小热区 88px；显示条件：state-dependent。
- `UI23_3`：Price；最小热区 88px；显示条件：state-dependent。
- `UI23_4`：Countdown；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 升级礼包触发与里程碑幂等。
- 不允许覆盖主操作超过一次/会话。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`LEVEL_OFFER_SHOW`、`LEVEL_OFFER_BUY`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI24｜奖励广告确认

**证据类型**：E/R　**Route**：`/reward-ad/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI24_1`：Reward；最小热区 88px；显示条件：state-dependent。
- `UI24_2`：RemainingCount；最小热区 88px；显示条件：state-dependent。
- `UI24_3`：Watch；最小热区 88px；显示条件：state-dependent。
- `UI24_4`：Cancel；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 观看前显示奖励与剩余次数。
- 广告失败不扣次数。
- 奖励只在验证成功后发放。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`AD_PROMPT_SHOW`、`AD_START`、`AD_COMPLETE`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI25｜活动中心

**证据类型**：R　**Route**：`/events`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI25_1`：EventCards；最小热区 88px；显示条件：state-dependent。
- `UI25_2`：Countdowns；最小热区 88px；显示条件：state-dependent。
- `UI25_3`：RedDots；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- Expired活动下沉或隐藏但结算入口仍可达。
- 红点必须有可消费原因。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`EVENT_CENTER_SHOW`、`EVENT_CARD_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI26｜时空追逐

**证据类型**：E　**Route**：`/events/race`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI26_1`：Goal；最小热区 88px；显示条件：state-dependent。
- `UI26_2`：Milestones；最小热区 88px；显示条件：state-dependent。
- `UI26_3`：MiniRanking；最小热区 88px；显示条件：state-dependent。
- `UI26_4`：Countdown；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 排行刷新不影响里程碑领取。
- 玩家自己的位置始终可定位。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`RACE_SHOW`、`RACE_REWARD_CLAIM`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI27｜芝士漂流

**证据类型**：E　**Route**：`/events/drift`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI27_1`：ProgressRoute；最小热区 88px；显示条件：state-dependent。
- `UI27_2`：Milestones；最小热区 88px；显示条件：state-dependent。
- `UI27_3`：FinalPack；最小热区 88px；显示条件：state-dependent。
- `UI27_4`：Countdown；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 终奖预览明确。
- 活动结束后未领里程碑自动邮件。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`DRIFT_SHOW`、`DRIFT_REWARD_CLAIM`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI28｜爆炒时刻

**证据类型**：E　**Route**：`/events/boost`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI28_1`：Countdown；最小热区 88px；显示条件：state-dependent。
- `UI28_2`：BoostRules；最小热区 88px；显示条件：state-dependent。
- `UI28_3`：AffectedProducers；最小热区 88px；显示条件：state-dependent。
- `UI28_4`：Progress；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 增强开始/结束必须在棋盘Producer上同步可视状态。
- 最后60秒与10秒非打断提示。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`BOOST_SHOW`、`BOOST_START`、`BOOST_END`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI29｜烹调争霸赛

**证据类型**：E　**Route**：`/events/cook-contest`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI29_1`：HeroArt；最小热区 88px；显示条件：state-dependent。
- `UI29_2`：Countdown；最小热区 88px；显示条件：state-dependent。
- `UI29_3`：Multiplier；最小热区 88px；显示条件：state-dependent。
- `UI29_4`：Progress；最小热区 88px；显示条件：state-dependent。
- `UI29_5`：Rewards；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 倍率按钮同时说明成本与收益。
- 切倍率不得重置已累积进度。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`COOK_CONTEST_SHOW`、`COOK_CONTEST_MULTIPLIER`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI30｜卡册首页

**证据类型**：E/R　**Route**：`/album`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI30_1`：SeasonHeader；最小热区 88px；显示条件：state-dependent。
- `UI30_2`：Sets；最小热区 88px；显示条件：state-dependent。
- `UI30_3`：Progress；最小热区 88px；显示条件：state-dependent。
- `UI30_4`：StarCurrency；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 展示总卡数/已收集数。
- 赛季结束时间明显。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`ALBUM_SHOW`、`ALBUM_SET_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI31｜卡组详情

**证据类型**：R　**Route**：`/album/set/:id`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI31_1`：CardSlots；最小热区 88px；显示条件：state-dependent。
- `UI31_2`：SetReward；最小热区 88px；显示条件：state-dependent。
- `UI31_3`：MissingCount；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 缺卡数量可见。
- 卡片稀有度不能仅靠颜色。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`ALBUM_SET_SHOW`、`CARD_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI32｜开卡包

**证据类型**：R　**Route**：`/album/open/:pack`　**表现**：fullScreen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI32_1`：Pack；最小热区 88px；显示条件：state-dependent。
- `UI32_2`：RevealCards；最小热区 88px；显示条件：state-dependent。
- `UI32_3`：NewBadge；最小热区 88px；显示条件：state-dependent。
- `UI32_4`：DuplicateValue；最小热区 88px；显示条件：state-dependent。
- `UI32_5`：Skip；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 动画可跳过。
- NEW/重复价值必须在每张卡上标识。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`PACK_OPEN_START`、`CARD_REVEAL`、`PACK_OPEN_END`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI33｜重复卡/星星兑换

**证据类型**：R　**Route**：`/album/exchange`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI33_1`：StarBalance；最小热区 88px；显示条件：state-dependent。
- `UI33_2`：ExchangeItems；最小热区 88px；显示条件：state-dependent。
- `UI33_3`：Guarantee；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 兑换前显示重复卡/星星消耗。
- 保底进度不可隐藏。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`ALBUM_EXCHANGE_SHOW`、`ALBUM_EXCHANGE`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI34｜赛季/通行证

**证据类型**：R　**Route**：`/season`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI34_1`：FreeTrack；最小热区 88px；显示条件：state-dependent。
- `UI34_2`：PaidTrack；最小热区 88px；显示条件：state-dependent。
- `UI34_3`：Level；最小热区 88px；显示条件：state-dependent。
- `UI34_4`：Tasks；最小热区 88px；显示条件：state-dependent。
- `UI34_5`：BuyPass；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 免费/付费轨对齐。
- 购买后补领已过等级奖励。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`PASS_SHOW`、`PASS_CLAIM`、`PASS_BUY`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI35｜邮箱

**证据类型**：R　**Route**：`/mail`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI35_1`：MailList；最小热区 88px；显示条件：state-dependent。
- `UI35_2`：Attachment；最小热区 88px；显示条件：state-dependent。
- `UI35_3`：ClaimAll；最小热区 88px；显示条件：state-dependent。
- `UI35_4`：Expiry；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 活动过期补发邮件单独标记来源。
- 全部领取要分批防服务器包过大。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`MAIL_SHOW`、`MAIL_CLAIM`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI36｜任务/成就

**证据类型**：R　**Route**：`/tasks`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI36_1`：Daily；最小热区 88px；显示条件：state-dependent。
- `UI36_2`：Weekly；最小热区 88px；显示条件：state-dependent。
- `UI36_3`：Achievements；最小热区 88px；显示条件：state-dependent。
- `UI36_4`：Claim；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 任务进度来源可追溯。
- 任务刷新时避免吞已完成未领奖励。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`TASK_SHOW`、`TASK_CLAIM`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI37｜设置

**证据类型**：R　**Route**：`/settings`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI37_1`：Music；最小热区 88px；显示条件：state-dependent。
- `UI37_2`：Sfx；最小热区 88px；显示条件：state-dependent。
- `UI37_3`：Vibration；最小热区 88px；显示条件：state-dependent。
- `UI37_4`：Notifications；最小热区 88px；显示条件：state-dependent。
- `UI37_5`：Language；最小热区 88px；显示条件：state-dependent。
- `UI37_6`：Account；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 音量即时预览。
- 危险账号操作放二级页。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`SETTINGS_SHOW`、`SETTING_CHANGE`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI38｜账号绑定

**证据类型**：R　**Route**：`/account`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI38_1`：Bindings；最小热区 88px；显示条件：state-dependent。
- `UI38_2`：UID；最小热区 88px；显示条件：state-dependent。
- `UI38_3`：BindButtons；最小热区 88px；显示条件：state-dependent。
- `UI38_4`：ConflictInfo；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 展示业务PlayerId与各渠道绑定。
- 跨渠道冲突需要明确选择而非覆盖。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`ACCOUNT_SHOW`、`ACCOUNT_BIND`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI39｜帮助/客服

**证据类型**：R　**Route**：`/support`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI39_1`：FAQ；最小热区 88px；显示条件：state-dependent。
- `UI39_2`：Contact；最小热区 88px；显示条件：state-dependent。
- `UI39_3`：Privacy；最小热区 88px；显示条件：state-dependent。
- `UI39_4`：Terms；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 客服入口包含UID/版本/配置版本复制。
- 外链打开前提示。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`SUPPORT_SHOW`、`FAQ_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI40｜网络断开

**证据类型**：R　**Route**：`modal:offline`　**表现**：modal

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI40_1`：Message；最小热区 88px；显示条件：state-dependent。
- `UI40_2`：Retry；最小热区 88px；显示条件：state-dependent。
- `UI40_3`：OfflineHint；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `ERROR`

### 页面特有规则

- 重试使用退避策略。
- 若有可离线内容明确告知。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`NETWORK_ERROR`、`NETWORK_RETRY`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI41｜资源不足通用弹窗

**证据类型**：R　**Route**：`modal:resource-shortage`　**表现**：modal

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI41_1`：ResourceIcon；最小热区 88px；显示条件：state-dependent。
- `UI41_2`：NeedHave；最小热区 88px；显示条件：state-dependent。
- `UI41_3`：Sources；最小热区 88px；显示条件：state-dependent。
- `UI41_4`：GoButton；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `ERROR`

### 页面特有规则

- 优先给游戏内免费来源。
- 来源入口按可获得性排序。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`RESOURCE_SHORTAGE_SHOW`、`RESOURCE_SOURCE_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI42｜通用奖励弹窗

**证据类型**：R　**Route**：`modal:reward`　**表现**：modal

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI42_1`：RewardGrid；最小热区 88px；显示条件：state-dependent。
- `UI42_2`：Confirm；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `ERROR`

### 页面特有规则

- 多奖励时支持滚动但主奖励首屏可见。
- 确认关闭前奖励已入Ledger。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`REWARD_POPUP_SHOW`、`REWARD_CONFIRM`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI43｜排行榜

**证据类型**：R　**Route**：`/ranking/:event`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI43_1`：SelfRank；最小热区 88px；显示条件：state-dependent。
- `UI43_2`：Rows；最小热区 88px；显示条件：state-dependent。
- `UI43_3`：RewardTiers；最小热区 88px；显示条件：state-dependent。
- `UI43_4`：Countdown；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 名次变化用轻量动画。
- 奖励区间固定可查。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`RANKING_SHOW`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI44｜公告/更新说明

**证据类型**：R　**Route**：`/news`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI44_1`：RichText；最小热区 88px；显示条件：state-dependent。
- `UI44_2`：Banner；最小热区 88px；显示条件：state-dependent。
- `UI44_3`：JumpLinks；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `EMPTY` / `ERROR` / `LOCKED` / `EXPIRED`

### 页面特有规则

- 富文本白名单。
- 活动跳转目标过期时降级到活动中心。

### 网络与数据

- 策略：**server-backed**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`NEWS_SHOW`、`NEWS_LINK_CLICK`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖

---

## UI45｜隐私/用户协议

**证据类型**：R　**Route**：`/legal`　**表现**：screen

### 布局

| 区域 | x | y | w | h | 用途 |
|---|---:|---:|---:|---:|---|
| top | 24 | 36 | 702 | 96 | title/resource/safe area |
| content | 24 | 148 | 702 | 1000 | primary content |
| bottom | 24 | 1160 | 702 | 126 | actions/navigation |

### 组件

- `UI45_1`：Terms；最小热区 88px；显示条件：state-dependent。
- `UI45_2`：Privacy；最小热区 88px；显示条件：state-dependent。
- `UI45_3`：Agree；最小热区 88px；显示条件：state-dependent。
- `UI45_4`：Decline；最小热区 88px；显示条件：state-dependent。

### 状态

`LOADING` / `READY` / `ERROR`

### 页面特有规则

- 首次必须显式同意。
- 拒绝行为符合渠道合规要求。

### 网络与数据

- 策略：**local-first**；超时 8000ms；重试：safe-idempotent-only。
- 埋点：`LEGAL_SHOW`、`LEGAL_AGREE`。

### 动效

- 进入 220ms；退出 160ms；按压 Scale 0.96；支持 Reduce Motion 降级。

### 验收

- [ ] 750×1334和750×1624无关键内容裁切
- [ ] 刘海/胶囊/底部手势区不遮挡关键CTA
- [ ] 中文文案放大10%不爆版
- [ ] 弱网/错误态可恢复
- [ ] 连续点击不会重复扣资源或重复领奖
