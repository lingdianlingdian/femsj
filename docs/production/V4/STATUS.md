# V4 Production Bible 状态

更新时间：2026-09-25

## 已落库

| 模块 | 当前量 | 状态 |
|---|---:|---|
| 关卡经营日 | 110 日 | ✅ 节奏蓝图完整 |
| Order Registry | 633 个订单槽位 | 🟡 Day1-10已公开文字转录；其余带证据/待转录状态 |
| UI页面 | 46 页 | ✅ 全页生产清单 |
| UI逐页规格 | 46 页 | ✅ Production Bible |
| UI Wireframe | 46 页 | ✅ 可交互HTML原型 |
| Design Token | 1套 | ✅ V4基线 |
| 字段级Schema | 1套 | ✅ Item/Producer/Recipe/Order/Day/Build/Event |
| Item公开种子 | 持续扩充（Day101-105 +41；Day80/84 +15） | 🟡 持续扩充 |
| Producer公开种子 | 4类 | 🟡 名称/部分产出已落库，容量/冷却/权重待采 |
| Transformation公开种子 | 6条 + Day101-105 Recipe 48条 | 🟡 Recipe Token已映射稳定ID，继续拆DAG |
| Asset Manifest | 225条 | 🟡 已从示例表升级为实际生产表 |
| Character Registry | 24角色位 | 🟡 原创占位，Canon Sheet待画 |
| Build Nodes | 48节点 | ✅ 原创4区蓝图 |
| Story Beats | 110日 | 🟡 Beat结构完整，对白/剧情正文待写 |
| LiveOps Event | 6套 | ✅ 可配置蓝图 |
| Economy | 观察值+开发默认值 | 🟡 版本敏感参数持续验证 |
| Config Validator | Node零依赖 | ✅ 已可执行 |
| Balance Simulator | Expected-cost v1 | 🟡 已可执行；Monte Carlo/盘面模拟待升级 |

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
- Day101-105：✅ 已转录 48 条公开菜谱/食材关系；“订单菜单截图”仍待逐单转录。
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
当前完成的是 Wireframe + production spec，不是最终 UI 美术稿。
还需要：
- 角色 Canon Sheet
- 建筑区域布局图
- 高保真原创 UI Kit
- Item/Producer/Cookware 最终资产

## P1
- 完整API Contract
- QA Test Case库
- Remote Config发布/回滚流程
- Balance Simulator可执行代码
- Config Validator可执行代码
- 全量剧情对白与本地化Key

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
