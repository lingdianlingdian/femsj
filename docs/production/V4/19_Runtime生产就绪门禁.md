# V4 Runtime Production Readiness Gate

更新时间：2026-09-25

## 目的

V4 研究数据、原创开发默认值与真正可发版 Runtime Config 必须分层。
本门禁把“还缺什么”转为机器可读结果，禁止因为文档量很大就误判为 Production Ready。

## 命令

```powershell
npm run audit:runtime
npm run audit:runtime:strict
```

- `audit:runtime`：报告模式。输出 blockers / warnings，但不会让当前持续研究阶段 CI 失败。
- `audit:runtime:strict`：发版模式。只要存在 Runtime blocker 就退出非 0。

## 2026-09-25 当前基线

| Area | 当前量 | Runtime blocker |
|---|---:|---:|
| Orders | 651 | 仅 113 单有 evidence-backed normalized requirements；Customer/Reward/Dependency 尚未生产化 |
| Producers | 10 | 10 个仍缺 Level/Energy/Capacity/Cooldown；2 个缺 Unlock Day |
| Producer Outputs | 21 | 21 条仍缺精确 Weight |
| Cookware | 4 | 4 个仍缺 Level/Queue/Speed/Unlock |
| Transform Graph | 64 relations | 非 Merge 关系仍有 Tool / Duration 缺口 |
| Build Nodes | 48 | 可作为原创开发默认值，但仍需平衡调优 |
| LiveOps Events | 6 | 合同已闭合；参数仍是原创开发默认值，需灰度调优 |

## Blocker 定义

### Order
1. 订单没有已验证、稳定 ItemId 的 requirements。
2. Customer 未指定。
3. Reward 未指定。
4. Producer / Recipe / Cookware 依赖集合仍是“未知”，而不是显式空集合。

### Producer
1. Level / EnergyCost / Capacity / Cooldown / UnlockDay 未定。
2. OutputPool 缺精确 Weight。

### Cookware / Recipe
1. Cookware Level / QueueSize / SpeedModifier / UnlockDay 未定。
2. 非 Merge Transformation 没有 Tool 映射或 Duration。

## Warning 定义

- 原创 Build Node 的开发默认价格/节奏未经过 Balance Simulator 结果回填。
- LiveOps 活动参数虽然 Schema/Validator 合法，但仍属于 DEV_BLUEPRINT，需要 staging / 灰度 / telemetry 校准。

## 发布门禁

V4 可以继续开发时使用报告模式；任何版本被标记为 **Production Ready** 之前必须满足：

```powershell
npm run audit:data
npm run audit:evidence
npm run audit:content
npm run audit:runtime:strict
```

并同时满足 Config Validator、Balance Simulator 与 P0/P1 QA 门禁。

## 原则

- 不用伪造参数消灭 blocker。
- 找不到竞品真实值时，可以设计原创 Runtime 默认值，但必须从 Evidence 层分离，并标记 DEV_BLUEPRINT。
- 空字符串不能表达“明确没有依赖”；Runtime 生产化时必须转成显式空数组或稳定引用。
