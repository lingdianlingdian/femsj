# V4 Production Bible 状态

更新时间：2026-09-25

## 已落库

| 模块 | 当前量 | 状态 |
|---|---:|---|
| 关卡经营日 | 110 日 | ✅ 节奏蓝图完整 |
| Order Registry | 651 个订单槽位 | 🟡 Day1-10已公开文字转录；其余带证据/待转录状态 |
| UI页面 | 46 页 | ✅ 全页生产清单 |
| UI逐页规格 | 46 页 | ✅ Production Bible |
| UI Wireframe | 46 页 | ✅ 可交互HTML原型 |
| Design Token | 1套 | ✅ V4基线 |
| 字段级Schema | 1套 | ✅ Item/Producer/Recipe/Order/Day/Build/Event |
| Item公开种子 | 持续扩充（Day101-105 +41；Day80/84 +15） | 🟡 持续扩充 |
| Producer公开种子 | 4类 | 🟡 名称/部分产出已落库，容量/冷却/权重待采 |
| Transformation公开种子 | 6条 + Day101-105 Recipe 48条 | 🟡 Recipe Token已映射稳定ID，继续拆DAG |
| Asset Manifest | 353条 | 🟡 已从示例表升级为实际生产表 |
| Character Canon | 26个原创角色 | ✅ Canon数据已落库；最终正式立绘/Spine待制作 |
| Build Nodes | 48节点 | ✅ 原创4区蓝图 |
| Story | 110日 / 268 Scenes / 821条对白 | ✅ 全量原创剧情与 zh-CN 本地化已落库并通过 Story Gate |
| LiveOps Event | 6套 | ✅ 可配置蓝图 |
| Economy | 观察值+开发默认值 | 🟡 版本敏感参数持续验证 |
| Config Validator | Node零依赖 | ✅ 已可执行 |
| Balance Simulator | Monte Carlo v3 | 🟢 已支持63格Board State、副产物跨订单复用、Storage、P(full board)、P(hard blocked)、压力清杂；跨Day库存/并行Cookware待v3.1 |

## 现在仍属于 P0 的真实缺口

### P0-A 原作公开关卡转录
- Day1-10：✅ 已公开文字逐单转录。
- Day11-20：有公开图片，未逐单文字化。
- Day51-60：有公开视频，未逐帧文字化。
- Day80：✅ 7个菜单项已视觉转录，并建立Recipe Evidence。
- Day82：✅ 已记录“无二次加工”公开结构约束；菜单图待转录。
- Day83：有公开图片，原图访问不稳定，继续转录。
- Day84：✅ 14个菜单项已视觉转录；19条Producer-Output公开分组证据已落库。
- Day86：公开2图，作者明确不完整。
- Day87：✅ 作者明确称完整，10张菜单图，Registry已改为10个公开待转录槽位。
- Day88：公开9图，完整性未确认。
- Day89：✅ 9张图 + 作者明确“还有个咖啡没截图”，Registry已改为至少10槽位。
- Day90：公开9图，作者称“差不多就这些”，不标完整。
- Day98：独立帖子14张动态图片，待逐图转录。
- Day99：独立帖子13张动态图片，待逐图转录。
- Day101-105：✅ 已逐项转录49个公开菜单/食谱条目，并映射稳定ItemId；已写回Order Registry。
- Day106-110：独立公开帖子已解析为 https://www.taptap.cn/moment/823602182489113413，五张菜单图待转录。
- 其他天数：继续搜索公开资料；找不到的保留 DEV_BLUEPRINT，不伪造。

### P0-B Producer / Recipe 精确参数
仍缺：
- 掉落池与权重
- Capacity
- Cooldown
- 高等级直出概率
- Cook 时间
- 加速价格

### P0-C 高保真视觉
已完成：
- ✅ 46页低保真 Wireframe
- ✅ 46页原创高保真 UI Kit 原型
- ✅ 41个共享UI组件/Prefab合同
- ✅ 4区街区布局/相机/热点规范
- ✅ 26角色 Canon
- ✅ 音频/动效生产规格

仍缺：
- 最终正式原创 Item / Producer / Cookware 图标
- 最终角色立绘/Spine
- 最终建筑成图与环境资源
- Cocos 实际 Prefab 接入与截图验收

## P1（主体已补齐）
- ✅ 完整 API Contract
- ✅ QA Test Case 库（117条）
- ✅ Remote Config发布/灰度/回滚流程
- ✅ Balance Simulator Monte Carlo v3 + Board-State Regression Gate
- ✅ Config Validator
- ✅ GitHub Actions质量门禁
- ✅ 全量原创剧情对白与本地化Key（110日 / 268 Scenes / 821条）

## 完成定义

V4 只有在以下条件全部满足后才标记为 Production Ready：

1. 110日每个 Order 都有可执行 requirements/rewards/dependencies。
2. 所有 Item/Producer/Recipe/Cookware 引用闭合。
3. 46页全部通过状态、适配、弱网、幂等验收。
4. Asset Manifest 的正式资源全部有 Canon/尺寸/Bundle/状态。
5. Balance Simulator 对110日全部跑通。
6. Config Validator 0 error。
7. QA P0/P1 用例全部通过。


## 可执行工具

```powershell
node tools/config-validator/validate.mjs <game_content.json>
node tools/balance-simulator/simulate.mjs <game_content.json> [day]
```


## 本轮证据资产化

- 新增 `research-data/levels/public_image_assets_v4.json/csv`
- 当前已固定 **50 个底层公开图片资产**：
  - Day11-15：1张长表
  - Day16-20：5张页面顺序图
  - Day80：食材+菜单2张
  - Day82：食材+菜单2张
  - Day83/84：食材+菜单4张
  - Day92：9张
  - Day93：10张
  - Day94：12张
  - Day106-110：5张
- 每个资产保存：帖子URL、底层图床URL、语义角色、转录状态、访问状态。
- CDN超时只记录为传输状态，不视为证据失效。

## 数据质量审计

- `items_seed_public.csv` 曾发现15行列数错位，已修复。
- Producer研究采集表已规范化拆成：
  - `producers_master_public.csv`（10个唯一Producer主记录）
  - `producer_outputs_public.csv`（21条Producer→Output证据）
- 当前已抽查的核心CSV全部列宽一致，0个坏行。
- Day80/84/101-105的持久证据文件已清除会话期 `turn...` 临时引用。
- 新增：
  - `npm run audit:evidence`
  - `npm run audit:data`


## 当前仓库质量基础设施

- `AGENTS.md`：Agent统一规则
- `api/openapi-v4.yaml`：服务端API合同
- `schemas/v4/remote_config.schema.json`
- `qa/v4/test_cases_v4.json`：117条QA用例
- `.github/workflows/v4-quality.yml`
- `npm run audit:data`
- `npm run audit:evidence`
- `npm run audit:content`
- Config Validator
- Balance Simulator Monte Carlo v3

## 已验证生产规模

- Order Registry：651
- Verified Order Requirements：113
- Verified Requirement unresolved：0
- UI Screens：46
- Shared UI Components：41
- Asset Manifest：353
- Original Character Canon：26
- Audio Assets：42
- Build Nodes：48
- Story Beats：110
- LiveOps Blueprints：6

## 2026-09-25 LiveOps 合同修复

- ✅ LiveOps Event Schema 与 `events_v4.json` 已完成合同对齐。
- ✅ milestone 统一使用 `rewards`；活动数据补齐 `evidence`。
- ✅ Schema 已覆盖竞速匹配、活动时长、Boost触发、卡册保底、Pass等级等生产字段。
- ✅ Config Validator 新增活动持续时间互斥、里程碑递增、奖励有效性、RACE/PASS/ALBUM必填项校验。
- ✅ QA 从 109 条扩充到 117 条，并同步 JSON/CSV。

## Runtime Production Readiness

- ✅ 新增 `tools/runtime-readiness/audit.mjs`，把 Runtime 缺口机器化统计。
- ✅ 新增 `npm run audit:runtime`（报告模式）与 `npm run audit:runtime:strict`（发版阻断模式）。
- ✅ CI 已加入 Runtime readiness 报告，不会用伪造值让当前研究阶段强行通过 strict。
- 当前关键缺口：651 单仅 113 单有 evidence-backed normalized requirements；Producer/Cookware/Recipe 精确参数仍是 P0-B；Customer/Reward/Dependency 仍未生产化。
- 说明文档：`docs/production/V4/19_Runtime生产就绪门禁.md`。

## Day1-10 可运行垂直切片

- ✅ Runtime Config：`production-data/v4/runtime/game_content_day001_010.json`
- ✅ 43 Orders / 41 Items / 7 Producers / 2 Cookware / 11 Recipes / 10 Days / 6 Build Nodes / 3 Events。
- ✅ Config Validator 通过，unresolvedItems=0。
- ✅ V2 数值门禁 + V3 真实盘面门禁均进入 CI。
- ✅ V3 OPTIMIZED 基线：Day1 P(hard blocked)=0、Energy P90≈41；Day10 P(hard blocked)=0、Energy P90≈55、Wait P90≈330s、Peak Board P90≈32、Peak Storage P90=0。
- ✅ Producer Pool 专门化后，Day10 Byproduct Utilization P50≈0.13，Pressure Clear P90=0；空间阻塞问题已从基线中消除。
- 规格：`docs/production/V4/20_BalanceSimulator_MonteCarlo_V3.md`。

## P0-B 参数证据门禁

- ✅ `research-data/evidence/p0b_parameter_evidence_matrix_v4.csv` 已作为精确参数进入 Runtime 前的证据门禁。
- ✅ 已确认机制：Producer 冷却/耗尽存在、部分 Producer→Output 关系、烤架/备菜台加工关系、活动加速/无限供应机制。
- ⚠️ 仍未拿到可审计的精确 level / energyCost / capacity / cooldownSec / outputWeight / Recipe duration / speedup / Cookware queue/speed。
- 因此：研究主表保持 UNRESOLVED；Day1-10 Runtime 数值继续明确标记 `DEV_BLUEPRINT`，两层不混写。


## 2026-09-25 美术并行生产启动

- ✅ 新增 14 个原创 Style Anchor 生产清单。
- ✅ 新增 ART-S1/S2/S3 美术生产队列，优先服务 Day1-10 可运行垂直切片。
- ✅ 新增 AI 美术 Job 合同，锁定原创性、透明背景、尺寸、Canon 与 64px 可读性门禁。
- ✅ 新增 `art-source/v4/` 源文件目录合同；公开竞品截图继续只留在 research-data 链接/证据层，不进入正式资源目录。
- 🟡 下一门禁：Anchor 概念稿 -> Canon Review -> 批量正式原图 -> Cocos Prefab 截图验收。

## Day1-10 原创剧情与本地化

- ✅ 26 个 Scene：20 个 Day Entry/Exit + 6 个 Build Scene。
- ✅ 80 条原创 zh-CN 对白 Key。
- ✅ Runtime `storyBefore/storyAfter` 全量闭合。
- ✅ BuildNode `story_trigger` 全量闭合。
- ✅ Speaker 全部引用 Character Canon 稳定 ID。
- ✅ `npm run validate:story` 已进入 CI。
- 主文件：`production-data/v4/story/story_dialogue_day001_010.json`
- 本地化：`production-data/v4/story/locale_zh-CN_day001_010.json`
- Schema：`schemas/v4/story_script.schema.json`
- 所有内容均为 `DEV_BLUEPRINT` 原创剧情，不复刻竞品剧情/角色/文案。

## Day1-10 经济门禁

- ✅ `npm run gate:economy:vertical` 已进入 CI。
- ✅ Total Coin Source=1,292；Build Sink=690；Source/Sink=1.8725。
- ✅ Ending Coin=602；Minimum Cumulative Coin=0。
- ✅ Max Daily Build/Source=1.2162；无不可支付 Build Node。
- 说明：`docs/production/V4/22_Day1-10经济平衡门禁.md`。
- 所有数值均为原创 `DEV_BLUEPRINT`，不作为竞品原作参数。


## Day1-10 美术合同闭合

- ✅ Asset Manifest：353 条。
- ✅ Style Anchor：14 个。
- ✅ 首批正式生产队列：109 项。
- ✅ S1-S3 可执行 AI Art Job：109 项，和队列 1:1 闭合。
- ✅ Day1-10 运行时内容美术：50 项（41 Item/Dish + 7 Producer + 2 Cookware）全部有 AssetId / Queue / Job。
- ✅ Day1-10 剧情角色：8 名；32 项 Canon/Avatar/Story/Spine 资产合同闭合。
- ✅ Street01 前 6 个 BuildNode：12 张 Before/After 正式资产合同闭合。
- ✅ `day001_010_art_coverage_v4.json`：94 项垂直切片必需资产 0 缺口。
- ✅ `render_waves_day001_010_v4.json`：W1 Core Shell 15、W2 Runtime Content 50、W3 Story Characters 32、W4 Street01 Buildings 12。
- ✅ CI 已接入 `npm run audit:art`；AssetId、Anchor、Queue、Job、产物状态与 Day1-10 覆盖缺口会阻断提交。
- 🟡 二进制正式成图仍以 `art_output_manifest_v4.json` 为准；只有实际图片经过 QA 后才能从 0 递增，禁止把 Job/Prompt 当成“成图完成”。

## 110日原创剧情完成

- ✅ Day1-110 全覆盖：11 个 Story Slice。
- ✅ 268 个 Scene / 821 条原创 zh-CN 对白。
- ✅ 220 个 Day Entry/Exit + 48 个 Build Scene。
- ✅ 48/48 BuildNode Story Trigger 闭合。
- ✅ Character Canon / Locale Key / Beat Registry 引用全部通过 `npm run validate:story:all`。
- ✅ 统一目录：`production-data/v4/story/story_catalog_v4.json`。
- 说明：`docs/production/V4/23_110日原创剧情交付说明.md`。
- 剧情文本本身不再属于 P1 缺口；后续仅剩 Cocos Dialogue Player、正式角色资源绑定与截图回归。


## 2026-09-25 全量美术资源入库完成

- ✅ Asset Manifest：353 / 353 已有正式原创 PNG。
- ✅ Style Anchor：14 / 14 已生成并 CANON_LOCKED。
- ✅ Production Queue：353 / 353 已闭合到执行 Job。
- ✅ 正式美术输出：353 / 353 APPROVED。
- ✅ Anchor + 正式资源实际 PNG：367 张已提交至 `art-source/v4/`。
- ✅ QA 文件：367 份；每张资源有独立 QA / SHA-256 / 尺寸记录。
- ✅ 4 区 × 12 BuildNode × Before/After：96 张建筑资产全部入库。
- ✅ 26 位角色 Avatar / NPC 及已定义 Canon/Story 资源全部入库。
- ✅ UI / Board / Item / Dish / Producer / Cookware / VFX 全类别均有正式文件。
- ✅ `npm run audit:art` 与 `npm run audit:art:files` 在生成工作流中通过。
- ✅ 全量生成提交：`8ca610945ab2854320fca6dfe2b396e28c3c0685`。
- ℹ️ Cocos Prefab/Atlas 的实际挂载属于引擎接入阶段；美术源资产、运行时 PNG、映射合同和 QA 已全部在仓库。
