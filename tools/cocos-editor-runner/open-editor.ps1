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
Write-Host "After the editor is ready:"
Write-Host "  Developer -> FEMSJ -> Generate V4 App Shell"
Write-Host "  Save scene as assets/App.scene"
Write-Host "  Generate/save UI00-UI45 Prefabs under assets/resources/ui/screens/"
Write-Host "  Then run: npm run cocos:editor:sync && npm run cocos:editor:check"

& $CocosCreatorExe --project $ProjectPath
exit $LASTEXITCODE
