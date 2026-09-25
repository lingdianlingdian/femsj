# AGENTS.md

## 项目
femsj：基于《肥鹅美食街》公开资料进行竞品研究，并制作一套可独立开发、原创美术与原创内容的 Merge-2 + Cooking + Orders + Reconstruction 微信小游戏 Production Bible。

## 强制边界

1. **公开证据与开发推导严格分离**
   - OFFICIAL / PUBLIC_TEXT / PUBLIC_IMAGE / PUBLIC_VIDEO / PLAYER_REPORT：研究证据层。
   - DEV_BLUEPRINT：原创开发补全。
   - 禁止把 DEV_BLUEPRINT 写成“原作精确配置”。

2. **版权边界**
   - 不复制原作角色造型、受版权保护的美术、UI皮肤、剧情全文、文案、图标和建筑。
   - 可以研究玩法结构、数值关系、公开界面信息架构和系统设计。
   - V4 UI Kit、角色、建筑、剧情必须保持原创。

3. **数据完整性**
   - 正式运行时不得引用 DEPRECATED_ALIAS。
   - 所有 Item / Producer / Recipe / Order / Day 使用稳定 ID。
   - 无证据数值保持 null/UNRESOLVED，不凭感觉伪填。
   - 每次修改 CSV 后运行数据审计。

4. **原子经济**
   - Wallet、奖励、广告、支付、订单提交、卡包、活动领奖必须幂等。
   - UI 不直接修改 Domain 经济状态。
   - 关键经济服务端权威。

5. **时间**
   - 活动、Producer cooldown、Cooking、Offer 使用 ServerTime。
   - 不信任设备系统时间。

## 技术栈
- Cocos Creator 3.8 LTS
- TypeScript
- 微信小游戏优先
- 配置驱动
- CommandBus + EventBus
- Snapshot + EventJournal
- 轻量后端 + Remote Config + LiveOps

## 关键目录
- docs/research/：竞品研究
- docs/production/V4/：Production Bible
- research-data/：证据层
- production-data/v4/：生产配置
- schemas/v4/：字段合同
- prototype/：UI原型
- tools/：校验与数值工具

## 提交前门禁

必须运行：

```powershell
npm run audit:data
npm run audit:evidence
npm run audit:content
```

若存在可运行完整配置，再运行：

```powershell
npm run validate:config -- production-data/v4/runtime/game_content.json
npm run simulate:balance -- production-data/v4/runtime/game_content.json
```

## UI
- 逻辑基准：750×1334
- SafeArea 动态读取
- 最小通用热区：88×88
- Board Cell：76×76 特例
- 46页必须复用 components_v4.json 组件，不得页面内重复造通用组件

## 关卡
- 公开转录完整日与 DEV_BLUEPRINT 日必须显式区分
- 普通订单禁止同时叠加：
  - 高体力
  - 长烹饪等待
  - 长 Producer 冷却
- 活动不可无兜底吞已达成奖励

## 美术
- 所有正式资产先分配 AssetId
- 角色通过 Canon 后再量产
- 建筑 Before/After 共享 Pivot / HitArea
- AI 生成素材必须经过 Canon / Readability / Perspective / Palette / Bundle / Performance 验收

## 修改原则
- 优先修根因，不打临时补丁
- 不破坏证据追溯
- 新字段先改 Schema，再改数据
- 新通用 UI 先登记 Component Registry
- 新运营参数必须可远程配置
