param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "k8s")]
    [string]$env
)

$src = ""
switch ($env) {
    "local" { $src = "app.config.local.json" }
    "k8s"   { $src = "app.config.k8s.json" }
}

$srcPath = Join-Path $PSScriptRoot $src
$destPath = Join-Path $PSScriptRoot "app.config.json"

Copy-Item -Path $srcPath -Destination $destPath -Force
Write-Host "Copied $src to app.config.json."
