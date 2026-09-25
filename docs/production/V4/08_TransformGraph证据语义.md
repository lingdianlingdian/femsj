# V4 Verified Transform Graph 语义

`transform_graph_verified_v4.json` 是研究证据图，不是强行补全的运行时配方表。

## 四类关系

- **MERGE2**：公开证据支持的二合关系。
- **COOK_CONFIRMED**：实机拆解明确看到食材+厨具→成品。
- **PROCESS_RECIPE_VISUAL**：公开食谱图能确认输入依赖，但厨具/时间可能未知。
- **DIRECT_ITEM**：菜单本身就是该Item，不能为了“表完整”捏造一条自己到自己的Recipe。

## 原则

1. 工具/容器（例如蒸笼）若出现在公开食谱里，先保留依赖，不擅自解释成可消耗食材。
2. durationSec 无证据则保持 null。
3. toolId 只有公开证据明确时填写。
4. DEV_BLUEPRINT 的正式运行时配方与 Evidence Graph 分文件维护。
