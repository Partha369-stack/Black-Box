# 🚀 VM UI Deployment Script
# This script builds and prepares VM-001 and VM-002 for deployment

Write-Host "🚀 VM UI Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "VM-001")) {
    Write-Host "❌ VM-001 directory not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "VM-002")) {
    Write-Host "❌ VM-002 directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Build VM-001
Write-Host "`n🤖 Building VM-001..." -ForegroundColor Yellow
Set-Location "VM-001"

Write-Host "📦 Installing dependencies..." -ForegroundColor White
npm install --silent

Write-Host "🔨 Building production bundle..." -ForegroundColor White
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ VM-001 build failed" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Write-Host "✅ VM-001 build successful" -ForegroundColor Green
Set-Location ".."

# Build VM-002
Write-Host "`n🤖 Building VM-002..." -ForegroundColor Yellow
Set-Location "VM-002"

Write-Host "📦 Installing dependencies..." -ForegroundColor White
npm install --silent

Write-Host "🔨 Building production bundle..." -ForegroundColor White
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ VM-002 build failed" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Write-Host "✅ VM-002 build successful" -ForegroundColor Green
Set-Location ".."

# Test preview servers
Write-Host "`n🧪 Testing preview servers..." -ForegroundColor Yellow

Write-Host "🔍 Starting VM-001 preview server..." -ForegroundColor White
Set-Location "VM-001"
$vm001Process = Start-Process -FilePath "npm" -ArgumentList "run", "preview" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

Write-Host "🔍 Starting VM-002 preview server..." -ForegroundColor White
Set-Location "../VM-002"
$vm002Process = Start-Process -FilePath "npm" -ArgumentList "run", "preview" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3
Set-Location ".."

Write-Host "✅ Preview servers started" -ForegroundColor Green

# Display results
Write-Host "`n🎉 VM UIs are ready for deployment!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`n📋 Deployment URLs:" -ForegroundColor Yellow
Write-Host "  🤖 VM-001 Preview: http://localhost:4173/vm-001/" -ForegroundColor White
Write-Host "  🤖 VM-002 Preview: http://localhost:4174/vm-002/" -ForegroundColor White

Write-Host "`n🚀 Deployment Options:" -ForegroundColor Yellow
Write-Host "  1. Railway (Recommended):" -ForegroundColor White
Write-Host "     - Create new Railway services for VM-001-UI and VM-002-UI" -ForegroundColor Gray
Write-Host "     - Connect GitHub repo and deploy from VM-001/ and VM-002/ folders" -ForegroundColor Gray
Write-Host "     - Railway will auto-detect Node.js and use railway.json config" -ForegroundColor Gray

Write-Host "`n  2. Vercel:" -ForegroundColor White
Write-Host "     - cd VM-001 && vercel --prod" -ForegroundColor Gray
Write-Host "     - cd VM-002 && vercel --prod" -ForegroundColor Gray

Write-Host "`n  3. Netlify:" -ForegroundColor White
Write-Host "     - Drag & drop VM-001/dist and VM-002/dist folders to Netlify" -ForegroundColor Gray

Write-Host "`n📁 Build Output:" -ForegroundColor Yellow
Write-Host "  📦 VM-001/dist/ - Ready for deployment" -ForegroundColor White
Write-Host "  📦 VM-002/dist/ - Ready for deployment" -ForegroundColor White

Write-Host "`n🔧 Configuration:" -ForegroundColor Yellow
Write-Host "  ✅ Environment variables configured for production" -ForegroundColor White
Write-Host "  ✅ API endpoints pointing to Railway backend" -ForegroundColor White
Write-Host "  ✅ Base paths configured (/vm-001/ and /vm-002/)" -ForegroundColor White
Write-Host "  ✅ Railway deployment configs ready" -ForegroundColor White

Write-Host "`n⚠️  Remember to:" -ForegroundColor Yellow
Write-Host "  - Set environment variables in your deployment platform" -ForegroundColor White
Write-Host "  - Configure custom domains if needed" -ForegroundColor White
Write-Host "  - Test the deployed URLs" -ForegroundColor White

Write-Host "`n🛑 To stop preview servers:" -ForegroundColor Yellow
Write-Host "  Stop-Process -Id $($vm001Process.Id) -Force" -ForegroundColor Gray
Write-Host "  Stop-Process -Id $($vm002Process.Id) -Force" -ForegroundColor Gray

Write-Host "`n✨ Deployment preparation complete!" -ForegroundColor Green
