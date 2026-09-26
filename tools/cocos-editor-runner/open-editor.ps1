param(
  [string]$CocosCreatorExe = $env:COCOS_CREATOR_EXE,
  [string]$ProjectPath = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($CocosCreatorExe)) {
  throw "Cocos Creator path is required. Pass -CocosCreatorExe or set COCOS_CREATOR_EXE."
}
if (-not (Test-Path -LiteralPath $CocosCreatorExe -PathType Leaf)) {
  throw "Cocos Creator executable not found: $CocosCreatorExe"
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
  $ProjectPath = Join-Path $repoRoot "client-cocos"
}
$ProjectPath = (Resolve-Path $ProjectPath).Path

$projectPackage = Join-Path $ProjectPath "package.json"
$extensionPackage = Join-Path $ProjectPath "extensions/femsj-editor-bootstrap/package.json"
if (-not (Test-Path $projectPackage)) { throw "Invalid Cocos project: missing $projectPackage" }
if (-not (Test-Path $extensionPackage)) { throw "Editor bootstrap extension missing: $extensionPackage" }

Write-Host "Opening Cocos Creator 3.8 project:"
Write-Host "  Creator: $CocosCreatorExe"
Write-Host "  Project: $ProjectPath"
Write-Host ""
Write-Host "Shortest acceptance path:"
Write-Host "  1. Open/create an empty scene."
Write-Host "  2. Developer -> FEMSJ -> Generate V4 App Shell"
Write-Host "  3. Developer -> FEMSJ -> Audit V4 App Shell (must PASS)"
Write-Host "  4. Save as assets/App.scene"
Write-Host "  5. Create UI00-UI45 Prefabs with Creator asset workflow under assets/resources/ui/screens/"
Write-Host "  6. Create Auto Atlas only for album, core, items_01, items_04, story"
Write-Host "  7. Follow client-cocos/acceptance/WINDOWS-CREATOR-3.8-RUNBOOK.md"
Write-Host "  8. Per batch: npm run cocos:editor:sync; npm run cocos:editor:check; npm run cocos:editor:progress"

& $CocosCreatorExe --project $ProjectPath
exit $LASTEXITCODE
