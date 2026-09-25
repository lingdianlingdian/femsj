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


## 下一批出图

```powershell
node tools/art-production-auditor/next.mjs 10
```

按 W1→W4 顺序返回下一批尚未 APPROVED/INTEGRATED 的正式美术 Job，直接提供 AssetId、Anchor、尺寸、prompt 与验收条件。


## W0 Style Anchor 门禁

正式 109 项生产资源现在被 W0 硬阻断。执行：

```powershell
npm run art:next -- 10
```

只要 14 个 Style Anchor 还有任一未 `CANON_LOCKED`，命令只返回 Anchor Job，不返回正式生产 Job。

Anchor 流程：

```powershell
npm run art:anchor:ingest -- ANCHOR_ITEM_01 art-source/v4/anchors/ANCHOR_ITEM_01.png
npm run art:anchor:qa:init -- ANCHOR_ITEM_01
# 填完 QA 文件后
npm run art:anchor:lock -- ANCHOR_ITEM_01
```

只有 14/14 Anchor 全部锁定，`art:next` 才进入 W1–W4。
