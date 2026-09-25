# femsj

《肥鹅美食街》公开资料竞品研究 + 同类原创产品 Production Bible 主仓库。

## 项目目标

把公开研究、产品设计、关卡、UI、美术、技术、QA 和工具链统一在一个可审计仓库中，最终做到可直接供策划、UI、美术、Cocos/TypeScript、后端、QA 与 Codex/AI 工程代理执行。

## 强制规则

- `OFFICIAL / PUBLIC_* / PLAYER_REPORT`：公开证据层。
- `DEV_BLUEPRINT`：原创开发补全。
- 不把开发推导冒充原作后台配置。
- 不复制原作角色造型、受版权保护美术、剧情全文、文案、图标和UI皮肤。
- 无证据的数值保持 `null / UNRESOLVED`。
- 后续所有主版本统一在本仓库 `main` 维护。

详细规则：`AGENTS.md`

## 当前版本

**V4 Production Bible（进行中）**

### 已完成的生产骨架

- 110日节奏蓝图
- Order Registry：651 个槽位
- 公开逐项验证订单：113 个，稳定 ItemId 映射 0 unresolved
- 46/46 页面 Production Bible
- 46页低保真交互 Wireframe
- 46页原创高保真 UI Kit 原型
- 41 个共享 UI Component / Prefab 合同
- 389 条 Asset Manifest / 389 正式原创资源 APPROVED
- 4个原创街区布局 + 相机/热点/NPC挂点规范
- 26个原创角色 Canon
- 42条音频资产规格 + Motion Manifest
- 48个建设节点
- 110日 Story Beat
- 110日原创剧情：268 Scenes / 821 条原创 zh-CN 对白 / 11 个可校验 Slice
- 6套 LiveOps 活动蓝图
- OpenAPI 后端合同
- Remote Config / 灰度 / 回滚合同
- 117条 QA Test Case
- GitHub Actions 自动质量门禁
- Config Validator
- Evidence / CSV / Content Reference Auditor
- Balance Simulator Monte Carlo v3（63格Board State / Storage / 副产物复用 / 满盘概率）
- Day1-110 可执行 Runtime：651 Orders / 143 Items / 14 Producers / 5 Cookware / 52 Recipes
- 全量 Runtime Art Binding：382 个唯一 AssetId，389/389 正式美术输出 APPROVED

## 目录

```text
AGENTS.md
api/
docs/
├─ audit/
├─ research/
└─ production/V4/
production-data/v4/
├─ art/
├─ audio/
├─ build/
├─ characters/
├─ content/
├─ economy/
├─ events/
├─ levels/
├─ liveops/
├─ story/
└─ ui/
prototype/
├─ v4-ui-wireframes/
└─ v4-ui-kit/
qa/v4/
research-data/
schemas/v4/
tools/
.github/workflows/
```

## 当前真实缺口

优先级最高：

1. Day11–20、51–60、82/83、87–90、92–99、106–110 等公开菜单继续逐项转录。
2. Producer 精确 output weight / capacity / cooldown / 高阶直出概率。
3. Recipe 精确 cookware / duration / speedup。
4. Cocos Creator 实际客户端：Scene / Prefab / Runtime Loader / Merge-2 Board / Dialogue Player / Asset Bundle 接入。
5. 46页真实客户端截图回归、微信小游戏真机性能/弱网/幂等验收。
6. Balance Simulator v3.1：跨Day库存继承、Cookware并行与活动Modifier。

## 快速检查

```powershell
npm run audit:data
npm run audit:evidence
npm run audit:content
npm run audit:runtime
npm run runtime:check:full
npm run gate:balance:full
npm run gate:balance:full-reachability
npm run validate:story:all
npm run audit:art:runtime-full
```

完整状态：`docs/production/V4/STATUS.md`  
仓库清单：`docs/production/V4/REPOSITORY_MANIFEST.md`


## 可运行垂直切片

Day1-10：`production-data/v4/runtime/game_content_day001_010.json`（43 Orders / 41 Items / 7 Producers / 2 Cookware / 11 Recipes）

质量门禁：`npm run gate:balance:vertical` + `npm run gate:balance:v3` + `npm run validate:story` + `npm run gate:economy:vertical`。


## 原创剧情

Day1-110 已全部落库。统一索引：`production-data/v4/story/story_catalog_v4.json`；全量门禁：`npm run validate:story:all`。


## Day1-110 全量 Runtime

主配置：`production-data/v4/runtime/game_content_day001_110.json`  
闭合报告：`production-data/v4/runtime/game_content_day001_110_report.json`  
确定性 Builder：`tools/runtime-full-builder/build.mjs`  
自动生成：`.github/workflows/v4-runtime-generate.yml`

当前：651 / 651 Order 可执行、110 / 110 Day Monte Carlo resolved、Reference Error=0、Missing Item Asset=0。113 单使用公开 evidence-backed requirements，538 单为明确标识的原创 `DEV_BLUEPRINT`，不冒充竞品菜单。
