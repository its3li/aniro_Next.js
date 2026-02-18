Write-Host "Building Next.js app..."
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Syncing with Capacitor..."
npx cap sync
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running on Android..."
npx cap run android
