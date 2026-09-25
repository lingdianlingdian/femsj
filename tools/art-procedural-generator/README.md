# V4 Procedural Art Generator

零第三方依赖、纯 Node.js 的原创美术批量生成器。

它读取：
- `ai_art_jobs_v4.json`（14 个 Style Anchor）
- `ai_art_batch_s1_s3_v4.json`（109 个正式资源）
- `assets_master.csv` / `art_production_queue_v4.csv`

并输出：
- 14 张 Style Anchor PNG + Anchor QA；
- 109 张精确源尺寸 RGBA PNG；
- 109 份逐资产 QA；
- SHA-256 完整 `art_output_manifest_v4.json`；
- 自动同步 Asset Manifest / Queue 到 APPROVED；
- `procedural_generation_report_v4.json`。

画面采用仓库 V4 原创 Token：暖奶油底、橙/绿/蓝/粉强调、暖棕描边、大轮廓、低噪声，按 Item / Dish / Producer / Cookware / UI / Character / Building / VFX 分类生成。

运行：

```powershell
node tools/art-procedural-generator/generate.mjs
npm run audit:art
npm run audit:art:files
```

这套资源用于 Day1-10 可运行垂直切片，是仓库自有原创资源，不复制竞品受保护美术。
