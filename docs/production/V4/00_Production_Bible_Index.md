# V4 Production Bible

> 状态：生产化补全中  
> 基线：V3 审计报告  
> 原则：公开证据层与开发推导层分离；V4 的目标是“可直接由策划/UI/美术/Cocos/后端/QA/Codex执行”。

## V4 P0

1. 110 日逐单关卡数据库
2. 全 Item / Producer / Recipe / Cookware 数据库
3. 46 页逐页 UI 规格 + 状态 + Wireframe 数据
4. 全量 Asset Manifest + 角色/建筑 Canon
5. 经济 / 建设 / 活动 / 剧情数据库

## 本轮已开始

- `ui/screens_v4.json`：46 个页面的生产级清单
- `ui/design_tokens_v4.json`：统一 UI token
- `schemas/v4/`：字段级 Schema
- `production-data/v4/`：后续正式配置数据
- `docs/production/V4/`：Production Bible 正文

## 证据来源补充

- TapTap 棋盘/订单/生产器公开截图：https://www.taptap.cn/forum/g1191393
- TapTap 商店公开截图：https://www.taptap.cn/app/835993/topic
- TapTap 烹调争霸赛公开截图：https://www.taptap.cn/forum/g1191393?page=2
- Google Play 官方页：https://play.google.com/store/apps/details?id=com.hortor.femsj.asia


## 并行美术生产

- `22_美术素材并行生产与首批任务.md`：正式美术并行流水线与首批垂直切片任务。
- `production-data/v4/art/style_anchor_manifest_v4.csv`：14 个原创 Style Anchor。
- `production-data/v4/art/art_production_queue_v4.csv`：ART-S1/S2/S3 首批生产队列。
- `production-data/v4/art/ai_art_jobs_v4.json`：首批 AI 美术 Job 规格与原创性门禁。
- `art-source/v4/README.md`：正式二进制源文件/导出物目录合同。
