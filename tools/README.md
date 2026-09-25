# femsj Production Tools

零第三方依赖，Windows / macOS / Linux 只需 Node.js 20+。

## 配置校验

```powershell
node tools/config-validator/validate.mjs production-data/v4/game_content.json
```

检查：
- ID重复和引用缺失
- Producer掉落权重
- Recipe/Transformation可引用性
- Day↔Order归属
- Build前置环
- Event结算
- 普通订单“三堵墙”
- 副产物利用率预警

## Balance Simulator（第一阶段）

```powershell
node tools/balance-simulator/simulate.mjs production-data/v4/game_content.json
node tools/balance-simulator/simulate.mjs production-data/v4/game_content.json 20
```

当前计算“期望体力 + 等待时间 + 可达路径”。后续阶段加入真正 Monte Carlo、盘面占格、共享副产物复用和 P50/P90/P95。
