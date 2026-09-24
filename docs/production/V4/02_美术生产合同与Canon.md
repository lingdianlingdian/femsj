# V4 美术生产合同

## 1. Asset Manifest

V4 不再使用“示例资产表”。`production-data/v4/art/assets_master.csv` 已建立首批实际生产行，当前覆盖：

- 通用 UI / Board 基础资产
- 已公开确认的食材/菜品种子
- 已点名 Producer
- 已确认 Cookware
- 24 个原创顾客角色占位
- 4 个街区 × 12 建设节点 × Before/After
- 通用 VFX

后续任何正式美术都必须先有 AssetId 再出图。

## 2. Canon

AI/人工美术都要遵守 Character Canon。每个正式角色至少保存：

- 正/侧/背比例
- 主辅色与描边色
- 头身比、眼/喙/脚等不变量
- 禁止变化项
- 6个基础表情
- Idle/Walk/Eat/Cheer/Sad 等动作
- 头像裁切规则
- 场景尺寸规则

## 3. Building Canon

每个 BuildNode 至少有 Before/After；核心节点可增加 Clean/Basic/Decorated/Alive。Before/After 必须共享 Pivot、点击热区和相机对齐坐标，才能无跳变升级。

## 4. 生产门禁

- 64×64 仍可辨识 Item；
- 同链相邻等级不可只差一个微小附件；
- Producer、Cookware、普通 Item 的轮廓语言不同；
- 所有 9-slice 有明确 inset；
- 所有 Spine 记录骨骼/顶点预算；
- 资产不得以“最终版2.png”命名；
- 正式资源入库前必须过 Canon、Readability、Bundle、性能四项检查。
