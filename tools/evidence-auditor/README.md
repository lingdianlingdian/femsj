# Evidence / Data Auditor

Windows / macOS / Linux，Node.js 20+：

```powershell
npm run audit:evidence
npm run audit:data
```

- `audit:evidence`：扫描 production-data / research-data / docs，阻止 ChatGPT 会话期 `turn...image/view/search` 临时引用进入持久研究档。
- `audit:data`：扫描核心 CSV，检查每行列数是否与表头一致。

V4 数据进入 Production Ready 之前，这两项都必须 PASS。
