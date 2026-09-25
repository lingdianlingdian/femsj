# Content Reference Auditor

检查已验证内容层的引用闭合：

```powershell
node tools/content-reference-auditor/audit.mjs
```

覆盖：
- 已逐项转录 Order → Item
- Verified Transform Graph 输入/输出 → Item
- Producer Output → Item
- Deprecated Alias 引用预警
- 活跃同名 Item 重复预警

`MISSING_ITEM` 为失败；Alias/重复名为警告。
