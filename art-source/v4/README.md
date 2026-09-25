# V4 Art Source Workspace

该目录用于正式原创美术源文件与导出物的目录合同。GitHub 当前先登记生产规范与任务；二进制源文件进入仓库时遵循以下结构：

```
art-source/v4/
  anchors/
  ui/
  board/items/
  board/producers/
  board/cookware/
  characters/
  street/area01/
  street/area02/
  street/area03/
  street/area04/
  vfx/
  exports/
```

规则：
- 正式文件名必须以 AssetId 或 AnchorId 开头。
- 公开研究截图不得复制到本目录。
- PSD/KRA/AI 等源文件与 PNG/WebP/Spine 导出物分离。
- 每次正式入库前先更新 `production-data/v4/art/art_production_queue_v4.csv` 状态。
- 只有通过 Canon / Readability / Perspective / Palette / Bundle / Performance / Originality QA 的资源可标记 APPROVED。
