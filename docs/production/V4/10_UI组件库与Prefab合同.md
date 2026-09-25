# V4 UI 组件库与 Prefab 合同

当前：
- **41 个共享生产组件**
- **46 个页面全部映射共享组件**
- 页面状态矩阵见 `screen_state_matrix_v4.csv`

## 目标

杜绝：
- 每个页面单独画/写一套按钮；
- 同一个订单卡在活动页和主盘行为不同；
- 倒计时各自用本机时间；
- 商店/礼包重复实现支付防抖；
- Error/Empty/Loading 只在部分页面存在。

## Cocos目录建议

```text
assets/prefabs/ui/
├─ common/
├─ board/
├─ recipe/
├─ street/
├─ shop/
├─ event/
├─ album/
├─ pass/
├─ mail/
├─ task/
└─ story/
```

## 强制规则

1. 页面只能组合 Component Registry 中的共享组件；新增通用组件先登记。
2. 所有资源变化组件走 ApplicationService，不直接改 Wallet。
3. Countdown 统一使用 ServerTime。
4. ProductCard / OfferCard / RewardClaim 都必须支持幂等状态。
5. Button最小热区 88×88；Board Cell按盘面76×76特例。
6. Loading / Error / Expired 的行为在状态矩阵中显式定义。
