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
| Asset Manifest | 225条 | 🟡 已从示例表升级为实际生产表 |
| Character Canon | 26个原创角色 | ✅ Canon数据已落库；最终正式立绘/Spine待制作 |
| Build Nodes | 48节点 | ✅ 原创4区蓝图 |
| Story Beats | 110日 | 🟡 Beat结构完整，对白/剧情正文待写 |
| LiveOps Event | 6套 | ✅ 可配置蓝图 |
| Economy | 观察值+开发默认值 | 🟡 版本敏感参数持续验证 |
| Config Validator | Node零依赖 | ✅ 已可执行 |
| Balance Simulator | Monte Carlo v2 | 🟡 已支持随机掉落/容量/冷却/Merge/Recipe P50/P90/P95；真实盘面模拟待v3 |

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
- ✅ Balance Simulator Monte Carlo v2
- ✅ Config Validator
- ✅ GitHub Actions质量门禁
- ⏳ 全量原创剧情对白与本地化Key

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
- Balance Simulator Monte Carlo v2

## 已验证生产规模

- Order Registry：651
- Verified Order Requirements：113
- Verified Requirement unresolved：0
- UI Screens：46
- Shared UI Components：41
- Asset Manifest：225
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
