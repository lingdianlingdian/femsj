# Art File Auditor

对已经写入 `art_output_manifest_v4.json` 的真实二进制美术文件做物理校验。

```powershell
npm run audit:art:files
```

当前自动检查：
- 文件必须位于 `art-source/v4/exports/`；
- 文件名必须匹配 Job 的正式 AssetId 输出合同；
- 文件必须真实存在；
- SHA-256 必须与 Manifest 一致；
- PNG Header / 宽高必须与 Manifest 一致；
- Job 要求透明背景时，PNG 必须带 Alpha 或 tRNS；
- 异常小文件直接失败。

当输出 Manifest 还是 0 项时，本门禁只给 warning，不阻塞 CI。
