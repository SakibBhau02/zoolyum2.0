# One-shot Vercel setup + deploy for Zoolyum.
# Prereq (one time only): npx -y vercel@latest login
# Usage: powershell -ExecutionPolicy Bypass -File scripts/vercel-setup.ps1
# Reads secrets from local .env (never committed), generates a FRESH production
# ADMIN_SECRET, sets all env vars on Vercel (production + preview), deploys --prod.

$ErrorActionPreference = "Continue"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path ".env")) { Write-Output "ERROR: .env not found."; exit 1 }

$envMap = @{}
Get-Content ".env" | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]*)"\s*$') { $envMap[$matches[1]] = $matches[2] }
}

$ADMIN_SECRET_PROD = (node -e "console.log(require('crypto').randomBytes(32).toString('base64'))").Trim()

$vars = [ordered]@{
  DATABASE_URL           = $envMap["DATABASE_URL"]
  ADMIN_PASSWORD         = $envMap["ADMIN_PASSWORD"]
  ADMIN_SECRET           = $ADMIN_SECRET_PROD
  STORAGE_DRIVER         = "r2"
  R2_ACCOUNT_ID          = $envMap["R2_ACCOUNT_ID"]
  R2_BUCKET              = $envMap["R2_BUCKET"]
  R2_ACCESS_KEY_ID       = $envMap["R2_ACCESS_KEY_ID"]
  R2_SECRET_ACCESS_KEY   = $envMap["R2_SECRET_ACCESS_KEY"]
  R2_PUBLIC_URL          = $envMap["R2_PUBLIC_URL"]
}

foreach ($k in $vars.Keys) {
  if (-not $vars[$k]) { Write-Output "ERROR: $k missing in .env"; exit 1 }
}

Write-Output "Linking Vercel project (accept defaults on first run)..."
npx -y vercel@latest link --yes

foreach ($target in @("production", "preview")) {
  foreach ($k in $vars.Keys) {
    npx -y vercel@latest env rm $k $target --yes 2>$null | Out-Null
    $vars[$k] | npx -y vercel@latest env add $k $target
  }
  Write-Output "env vars set for $target."
}

Write-Output "Deploying to production..."
npx -y vercel@latest --prod --yes
