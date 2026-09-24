# V4 Production Bible 状态

更新时间：2026-09-25

## 已落库

| 模块 | 当前量 | 状态 |
|---|---:|---|
| 关卡经营日 | 110 日 | ✅ 节奏蓝图完整 |
| Order Registry | 617 个订单槽位 | 🟡 Day1-10已公开文字转录；其余带证据/待转录状态 |
| UI页面 | 46 页 | ✅ 全页生产清单 |
| UI逐页规格 | 46 页 | ✅ Production Bible |
| UI Wireframe | 46 页 | ✅ 可交互HTML原型 |
| Design Token | 1套 | ✅ V4基线 |
| 字段级Schema | 1套 | ✅ Item/Producer/Recipe/Order/Day/Build/Event |
| Item公开种子 | 约50项 | 🟡 持续扩充 |
| Producer公开种子 | 4类 | 🟡 参数待采 |
| Transformation公开种子 | 6条 | 🟡 持续扩充 |
| Asset Manifest | 225条 | 🟡 已从示例表升级为实际生产表 |
| Character Registry | 24角色位 | 🟡 原创占位，Canon Sheet待画 |
| Build Nodes | 48节点 | ✅ 原创4区蓝图 |
| Story Beats | 110日 | 🟡 Beat结构完整，对白/剧情正文待写 |
| LiveOps Event | 6套 | ✅ 可配置蓝图 |
| Economy | 观察值+开发默认值 | 🟡 版本敏感参数持续验证 |

## 现在仍属于 P0 的真实缺口

### P0-A 原作公开关卡转录
- Day11-20：有公开图片，未逐单文字化。
- Day51-60：有公开视频，未逐帧文字化。
- Day80/82/83/84/101-110：有公开图片/帖子，未全部逐单文字化。
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
