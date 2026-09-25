# Art Ingest / QA / Approval

正式美术不是“生成出来”就自动算完成。

## 1. 放入正式导出目录

例如：

```
art-source/v4/exports/art-s1/art_item_fanqie.png
```

文件名必须等于 Job 的 `output_contract.filename`。

## 2. 自动登记

```powershell
npm run art:ingest -- art_item_fanqie art-source/v4/exports/art-s1/art_item_fanqie.png
```

自动检查：
- AssetId / Job 是否存在；
- 路径是否在 exports 下；
- 文件名；
- PNG Header；
- 目标尺寸；
- 透明通道；
- SHA-256。

通过后自动：
- 写入 `art_output_manifest_v4.json`；
- Queue -> GENERATED；
- Asset Manifest -> GENERATED。

## 3. 建 QA Checklist

```powershell
npm run art:qa:init -- art_item_fanqie
```

生成 `art-source/v4/qa/art_item_fanqie.json`。所有布尔门禁默认 false，必须经过视觉审查逐项修改；不同类别会自动加入额外门禁。

## 4. 批准

QA 文件必须：
- 所有 gates = true；
- reviewer 非空；
- decision = APPROVE。

然后执行：

```powershell
npm run art:approve -- art_item_fanqie
```

脚本才会把 Output / Queue / Asset Manifest 同步推进为 `APPROVED`。

这保证“有图”“通过QA”“进Cocos”是三个不同状态。
