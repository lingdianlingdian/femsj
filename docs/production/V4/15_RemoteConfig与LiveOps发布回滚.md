# V4 Remote Config / LiveOps 发布与回滚

## 环境

```text
DEV → STAGING → PROD
```

禁止跳过 STAGING 直接发布生产经济配置。

## 发布对象

每次发布是一个不可变 `RemoteConfigEnvelope`：

- configVersion
- contentRevision
- validFrom / validTo
- min/max app version
- rollout
- payload
- signature
- rollbackOf

历史版本不覆盖，只新增。

## 灰度

推荐生产顺序：

1. 内部 allowlist
2. 1%
3. 5%
4. 10%
5. 25%
6. 50%
7. 100%

灰度桶：

```text
hash(PlayerId + configVersion) % 10000
```

同一玩家在一个版本内始终命中同一桶，避免会话间跳配置。

## 生产发布门禁

发布前必须：

- Schema validate = PASS
- Config Validator = PASS
- Data Auditor = PASS
- Evidence Auditor = PASS
- Content Reference Auditor = PASS
- 110日 Balance 检查无P0错误
- Event start/end 时间合法
- Offer SKU 在目标渠道存在
- Reward 不为负
- 不包含已过期 AssetBundle URL
- minAppVersion 与客户端能力匹配

## 签名

客户端只接受：
- HTTPS
- 已知 keyId
- ED25519 签名通过
- payload SHA256 一致
- validFrom 已到达
- appVersion 在兼容区间

签名失败：
- 保留 last-known-good 配置
- 禁止关键经济使用未验证配置
- 上报 CONFIG_SIGNATURE_INVALID

## 回滚

回滚不是删除生产版本，而是发布一个新的 Envelope：

```json
{
  "configVersion": "4.1.1",
  "rollbackOf": "4.1.0"
}
```

payload 复制上一个稳定版本。

目标：
- 5分钟内完成配置回滚
- 无需客户端发版
- 玩家本地未完成操作按 server revision 重新校验

## 活动时间边界

活动实例状态：

```text
SCHEDULED → ACTIVE → SETTLING → ENDED
```

禁止：
- ACTIVE直接删除
- 到期入口消失但不给已达成奖励
- 结束瞬间的合法Submit被重复结算

默认：
`settlement = AUTO_MAIL`

## 旧客户端兼容

字段新增必须向后兼容：
- 可选字段提供默认值
- 删除字段至少跨一个大版本弃用
- 新 Event Modifier 必须受 minAppVersion 保护
- 未识别 FeatureFlag 默认 false

## 配置观察性

每个业务事件日志至少包含：

- appVersion
- configVersion
- contentRevision
- channel
- playerId hash
- eventId / offerId（如适用）

这样任何留存/付费/异常波动都能反查具体配置。
