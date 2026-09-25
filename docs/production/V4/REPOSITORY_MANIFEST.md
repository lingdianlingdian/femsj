# V4 Repository Manifest

> 目的：明确“哪个文件才是当前主文件”，防止 V2/V3/seed/master/证据表混用。

## Agent / 项目规则

| 主题 | 唯一主文件 |
|---|---|
| Agent总规则 | `/AGENTS.md` |
| 项目入口 | `/README.md` |
| V4状态 | `docs/production/V4/STATUS.md` |

## 关卡

| 用途 | 主文件 |
|---|---|
| 110日研究/占位总注册表 | `production-data/v4/levels/order_registry_110.json` |
| 已公开逐项验证需求 | `production-data/v4/levels/order_requirements_verified.json` |
| 可供UI/内容联调的证据切片 | `production-data/v4/levels/verified_level_slice_v4.json` |
| 公开来源索引 | `research-data/levels/public_menu_sources.csv` |
| 公开图片资产索引 | `research-data/levels/public_image_assets_v4.json` |
| 证据覆盖率 | `research-data/levels/evidence_coverage_v4.json` |
| 110日节奏蓝图 | `research-data/levels/level_blueprint_110.json` |

## Content

| 用途 | 主文件 |
|---|---|
| Item研究总表 | `production-data/v4/content/items_seed_public.csv` |
| Canonical Alias | `production-data/v4/content/content_aliases.json` |
| Producer主表 | `production-data/v4/content/producers_master_public.csv` |
| Producer→Output证据 | `production-data/v4/content/producer_outputs_public.csv` |
| Cookware证据 | `production-data/v4/content/cookware_seed_public.csv` |
| Verified Transform Graph | `production-data/v4/content/transform_graph_verified_v4.json` |
| 101–105公开Recipe表 | `production-data/v4/content/recipes_day101_105_public.json` |

> `producers_seed_public.csv` 是历史采集表，不作为程序主表。

## UI

| 用途 | 主文件 |
|---|---|
| 46页页面合同 | `production-data/v4/ui/screens_v4.json` |
| Design Tokens | `production-data/v4/ui/design_tokens_v4.json` |
| Shared Components | `production-data/v4/ui/components_v4.json` |
| Screen State Matrix | `production-data/v4/ui/screen_state_matrix_v4.csv` |
| 低保真原型 | `prototype/v4-ui-wireframes/index.html` |
| 原创高保真基线 | `prototype/v4-ui-kit/index.html` |

## 美术 / 角色 / 世界

| 用途 | 主文件 |
|---|---|
| Asset Manifest | `production-data/v4/art/assets_master.csv` |
| Motion Manifest | `production-data/v4/art/motion_manifest_v4.csv` |
| Character Canon | `production-data/v4/characters/character_canon_v4.json` |
| 4区世界布局 | `production-data/v4/build/street_layout_4areas.json` |
| Build Nodes | `production-data/v4/build/build_nodes_4areas.json` |
| Audio Manifest | `production-data/v4/audio/audio_manifest_v4.json` |

## 经济 / LiveOps

| 用途 | 主文件 |
|---|---|
| 开发经济默认值 | `production-data/v4/economy/economy_v4.json` |
| 竞品经济观察值 | `research-data/economy/observation_ledger_v4.json` |
| 商业化观察摘要 | `production-data/v4/economy/monetization_observations.json` |
| 活动蓝图 | `production-data/v4/events/events_v4.json` |
| Remote Config Schema | `schemas/v4/remote_config.schema.json` |
| Remote Config Example | `production-data/v4/liveops/remote_config.example.json` |

## 技术合同

| 用途 | 主文件 |
|---|---|
| Content Schema | `schemas/v4/game_content.schema.json` |
| API | `api/openapi-v4.yaml` |
| QA Cases | `qa/v4/test_cases_v4.json` |
| CI | `.github/workflows/v4-quality.yml` |

## 工具

| 工具 | 路径 |
|---|---|
| Config Validator | `tools/config-validator/validate.mjs` |
| Balance Simulator Monte Carlo v2 | `tools/balance-simulator/simulate.mjs` |
| Balance Simulator v3 Board State | `tools/balance-simulator-v3/simulate.mjs` |
| Balance Simulator v3 Gate | `tools/balance-simulator-v3/gate.mjs` |
| Evidence Auditor | `tools/evidence-auditor/audit.mjs` |
| CSV Data Auditor | `tools/data-auditor/audit.mjs` |
| Content Reference Auditor | `tools/content-reference-auditor/audit.mjs` |
| Runtime Readiness Auditor | `tools/runtime-readiness/audit.mjs` |
| Story Validator | `tools/story-validator/validate.mjs` |
| Vertical Economy Auditor | `tools/economy-slice-auditor/audit.mjs` |

## 历史文件使用规则

- `docs/research/V1`, `V2`, `docs/production/V3`：只用于历史追溯。
- 新开发决策优先看 V4。
- seed 文件若已有对应 master 文件，以 master 为准。
- 竞品 Evidence 与原创 Runtime Config 不混表。

## Runtime Vertical Slice

| 用途 | 主文件 |
|---|---|
| Day1-10 可运行配置 | `production-data/v4/runtime/game_content_day001_010.json` |
| V2数值阈值 | `production-data/v4/runtime/vertical_slice_balance_targets.json` |
| V3盘面阈值 | `production-data/v4/runtime/vertical_slice_board_targets.json` |

## Story / Localization

| 用途 | 主文件 |
|---|---|
| 110日 Story Beat | `production-data/v4/story/story_beats_110.csv` |
| 110日 Story Catalog | `production-data/v4/story/story_catalog_v4.json` |
| 11个原创 Story Slice | `production-data/v4/story/story_dialogue_dayXXX_YYY.json` |
| 11个 zh-CN Locale Slice | `production-data/v4/story/locale_zh-CN_dayXXX_YYY.json` |
| Story Schema | `schemas/v4/story_script.schema.json` |
| 单 Slice Validator | `tools/story-validator/validate.mjs` |
| 全量 Story Gate | `tools/story-validator/validate-all.mjs` |

## Vertical Economy

| 用途 | 主文件 |
|---|---|
| Day1-10 经济阈值 | `production-data/v4/runtime/vertical_slice_economy_targets.json` |
| 经济门禁说明 | `docs/production/V4/22_Day1-10经济平衡门禁.md` |
