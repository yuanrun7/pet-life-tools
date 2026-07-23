$ErrorActionPreference = 'Stop'

$runtimeRoot = 'C:\Users\lenovo\.cache\codex-runtimes\codex-primary-runtime\dependencies'
$node = Join-Path $runtimeRoot 'node\bin\node.exe'
$nodeModules = Join-Path $runtimeRoot 'node\node_modules'
$playwrightCore = Join-Path $nodeModules '.pnpm\playwright-core@1.61.1\node_modules'

if (-not (Test-Path -LiteralPath $node)) {
  throw "Bundled Node.js was not found at $node"
}

$env:NODE_PATH = "$nodeModules;$playwrightCore"
& $node (Join-Path $PSScriptRoot 'run-core-flows.cjs')
exit $LASTEXITCODE
