# V4 API合同

正式API合同：`api/openapi-v4.yaml`

## 关键约束

- 业务主键是 `PlayerId`，渠道身份只是绑定。
- 所有会发资源/扣资源的POST必须携带 `Idempotency-Key`。
- 游戏命令使用 `X-Client-Revision` 做乐观并发。
- 冲突不允许“最后写入覆盖”。
- 支付与广告先向平台验证，再写 Economy Ledger。
- ServerTime 是Producer/Cooking/Event/Offer唯一关键计时权威。
- 活动过期但已达成的奖励走自动结算/邮箱。
- 接口错误必须返回 `requestId` 供客服与日志关联。

# V4 后端错误码

| Code | HTTP | 客户端行为 |
|---|---:|---|
| AUTH_INVALID | 401 | 清Session→登录 |
| ACCOUNT_CONFLICT | 409 | 打开账号冲突处理页，禁止静默覆盖 |
| REVISION_CONFLICT | 409 | 拉取delta/最新snapshot，重放安全命令 |
| COMMAND_INVALID | 422 | 回滚本地预测，显示可解释提示 |
| BOARD_FULL | 422 | 不扣体力，棋盘提示 |
| ENERGY_NOT_ENOUGH | 422 | 打开体力补充入口 |
| PRODUCER_COOLDOWN | 422 | 展示服务端剩余时间 |
| COOKWARE_BUSY | 422 | 不消耗输入 |
| ORDER_REQUIREMENT_MISSING | 422 | 刷新订单拥有数量 |
| REWARD_ALREADY_CLAIMED | 409 | 使用第一次结果，不重复发奖 |
| AD_VERIFY_FAILED | 422 | 不扣广告次数，允许安全重试 |
| PAYMENT_INVALID | 422 | 显示支付校验失败并提供客服/补单 |
| PAYMENT_ALREADY_DELIVERED | 409 | 返回原发货结果 |
| OFFER_EXPIRED | 422 | 关闭购买按钮并刷新LiveOps |
| EVENT_EXPIRED | 422 | 进入结算/邮件补发流程 |
| CONFIG_OUTDATED | 409 | 拉取新配置，不允许继续关键经济写入 |
| RATE_LIMITED | 429 | 指数退避 |
| SERVER_ERROR | 500 | requestId可复制，幂等重试 |
