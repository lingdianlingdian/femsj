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
- 225 条 Asset Manifest
- 4个原创街区布局 + 相机/热点/NPC挂点规范
- 26个原创角色 Canon
- 42条音频资产规格 + Motion Manifest
- 48个建设节点
- 110日 Story Beat
- 6套 LiveOps 活动蓝图
- OpenAPI 后端合同
- Remote Config / 灰度 / 回滚合同
- 117条 QA Test Case
- GitHub Actions 自动质量门禁
- Config Validator
- Evidence / CSV / Content Reference Auditor
- Balance Simulator Monte Carlo v3（63格Board State / Storage / 副产物复用 / 满盘概率）

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
4. 110日所有 Order 的 reward / dependency 生产配置。
5. 最终正式原创 Item / Producer / Cookware / Character / Building 美术资产。
6. Balance Simulator v3 已完成；下一步 v3.1 补跨Day库存继承、Cookware并行与活动Modifier。

## 快速检查

```powershell
npm run audit:data
npm run audit:evidence
npm run audit:content
npm run audit:runtime
```

完整状态：`docs/production/V4/STATUS.md`  
仓库清单：`docs/production/V4/REPOSITORY_MANIFEST.md`


## 可运行垂直切片

Day1-10：`production-data/v4/runtime/game_content_day001_010.json`（43 Orders / 41 Items / 7 Producers / 2 Cookware / 11 Recipes）

质量门禁：`npm run gate:balance:vertical` + `npm run gate:balance:v3`。
