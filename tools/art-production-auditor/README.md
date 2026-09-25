# Art Production Auditor

零第三方依赖的 V4 美术生产合同检查器。

运行：

```powershell
npm run audit:art
```

检查：
- `assets_master.csv` AssetId 唯一性；
- Style Anchor 唯一性；
- 生产队列 AssetId / Anchor 引用闭合；
- 状态机合法；
- AI Anchor Job + S1-S3 执行 Job 的 JobId 唯一性与目标引用；
- 每一个首批生产队列资产都有可执行 AI Job；
- 二进制产物 Manifest 的路径、尺寸、SHA-256、状态与验收门禁；
- APPROVED / INTEGRATED 资产必须通过 Canon、Readability、Perspective、Palette、Bundle、Performance、Originality 七项门禁。

当前允许“0 个二进制正式产物”作为 warning，使生产合同可先进入 CI；一旦资源开始入库，产物错误会直接失败。
