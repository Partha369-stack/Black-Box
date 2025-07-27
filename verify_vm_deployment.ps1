# 🔍 VM Deployment Verification Script
# This script verifies that VM-001 and VM-002 are ready for deployment

Write-Host "🔍 VM Deployment Verification" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# Check VM-001
Write-Host "`n🤖 Checking VM-001..." -ForegroundColor Yellow

if (-not (Test-Path "VM-001/dist")) {
    $errors += "VM-001/dist directory not found. Run 'npm run build' in VM-001 folder."
} else {
    Write-Host "✅ VM-001 build output exists" -ForegroundColor Green
}

if (-not (Test-Path "VM-001/.env")) {
    $warnings += "VM-001/.env file not found. Environment variables may not be configured."
} else {
    Write-Host "✅ VM-001 environment file exists" -ForegroundColor Green
}

if (-not (Test-Path "VM-001/railway.json")) {
    $warnings += "VM-001/railway.json not found. Railway deployment may not work."
} else {
    Write-Host "✅ VM-001 Railway config exists" -ForegroundColor Green
}

# Check VM-002
Write-Host "`n🤖 Checking VM-002..." -ForegroundColor Yellow

if (-not (Test-Path "VM-002/dist")) {
    $errors += "VM-002/dist directory not found. Run 'npm run build' in VM-002 folder."
} else {
    Write-Host "✅ VM-002 build output exists" -ForegroundColor Green
}

if (-not (Test-Path "VM-002/.env")) {
    $warnings += "VM-002/.env file not found. Environment variables may not be configured."
} else {
    Write-Host "✅ VM-002 environment file exists" -ForegroundColor Green
}

if (-not (Test-Path "VM-002/railway.json")) {
    $warnings += "VM-002/railway.json not found. Railway deployment may not work."
} else {
    Write-Host "✅ VM-002 Railway config exists" -ForegroundColor Green
}

# Check backend connectivity
Write-Host "`n🌐 Checking backend connectivity..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://black-box-production.up.railway.app/api/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is accessible" -ForegroundColor Green
    } else {
        $warnings += "Backend returned status code: $($response.StatusCode)"
    }
} catch {
    $errors += "Cannot connect to backend: $($_.Exception.Message)"
}

# Check if preview servers are running
Write-Host "`n🖥️  Checking preview servers..." -ForegroundColor Yellow

try {
    $vm001Response = Invoke-WebRequest -Uri "http://localhost:4173/vm-001/" -TimeoutSec 5
    Write-Host "✅ VM-001 preview server is running" -ForegroundColor Green
} catch {
    $warnings += "VM-001 preview server not accessible. Run 'npm run preview' in VM-001 folder."
}

try {
    $vm002Response = Invoke-WebRequest -Uri "http://localhost:4174/vm-002/" -TimeoutSec 5
    Write-Host "✅ VM-002 preview server is running" -ForegroundColor Green
} catch {
    $warnings += "VM-002 preview server not accessible. Run 'npm run preview' in VM-002 folder."
}

# Display results
Write-Host "`n📊 Verification Results" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "`n🎉 No critical errors found!" -ForegroundColor Green
    Write-Host "Your VMs are ready for deployment! 🚀" -ForegroundColor Green
} else {
    Write-Host "`n❌ Critical Errors Found:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  • $error" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  Warnings:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  • $warning" -ForegroundColor Yellow
    }
}

if ($errors.Count -eq 0) {
    Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to railway.app and create new services" -ForegroundColor White
    Write-Host "2. Deploy VM-001 folder to VM-001-UI service" -ForegroundColor White
    Write-Host "3. Deploy VM-002 folder to VM-002-UI service" -ForegroundColor White
    Write-Host "4. Configure environment variables in Railway" -ForegroundColor White
    Write-Host "5. Test your deployed URLs" -ForegroundColor White
    
    Write-Host "`n📋 Deployment URLs will be:" -ForegroundColor Yellow
    Write-Host "  VM-001: https://vm-001-ui.up.railway.app/vm-001/" -ForegroundColor White
    Write-Host "  VM-002: https://vm-002-ui.up.railway.app/vm-002/" -ForegroundColor White
}

Write-Host "`n✨ Verification complete!" -ForegroundColor Green
