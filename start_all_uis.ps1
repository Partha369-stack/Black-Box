# BLACK_BOX Vending Machine System - Start All UIs
# This script starts the backend API and all three frontend UIs

Write-Host "🚀 Starting BLACK_BOX Vending Machine System..." -ForegroundColor Green

# Start Backend API
Write-Host "`n📡 Starting Backend API..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "python" -ArgumentList "Backend\index.py" -WorkingDirectory "D:\B__B\BLACK_BOX" -PassThru -WindowStyle Minimized
Write-Host "✅ Backend started (PID: $($backend.Id))" -ForegroundColor Green

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start Admin UI (Port 8000)
Write-Host "`n👨‍💼 Starting Admin UI..." -ForegroundColor Yellow
$admin = Start-Process -FilePath "npm" -ArgumentList "run", "dev", "--", "--port", "8000" -WorkingDirectory "D:\B__B\BLACK_BOX\Admin" -PassThru -WindowStyle Minimized
Write-Host "✅ Admin UI started (PID: $($admin.Id)) - http://localhost:8000" -ForegroundColor Green

# Start VM-001 UI (Port 8081)
Write-Host "`n🤖 Starting VM-001 UI..." -ForegroundColor Yellow  
$vm001 = Start-Process -FilePath "npm" -ArgumentList "run", "dev", "--", "--port", "8081" -WorkingDirectory "D:\B__B\BLACK_BOX\VM-001" -PassThru -WindowStyle Minimized
Write-Host "✅ VM-001 UI started (PID: $($vm001.Id)) - http://localhost:8081" -ForegroundColor Green

# Start VM-002 UI (Port 8083)
Write-Host "`n🤖 Starting VM-002 UI..." -ForegroundColor Yellow
$vm002 = Start-Process -FilePath "npm" -ArgumentList "run", "dev", "--", "--port", "8083" -WorkingDirectory "D:\B__B\BLACK_BOX\VM-002" -PassThru -WindowStyle Minimized
Write-Host "✅ VM-002 UI started (PID: $($vm002.Id)) - http://localhost:8083" -ForegroundColor Green

Write-Host "`n🎉 All services started successfully!" -ForegroundColor Green
Write-Host "`n📋 Access URLs:" -ForegroundColor Cyan
Write-Host "  👨‍💼 Admin Panel:  http://localhost:8000" -ForegroundColor White
Write-Host "  🤖 VM-001 UI:     http://localhost:8081" -ForegroundColor White  
Write-Host "  🤖 VM-002 UI:     http://localhost:8083" -ForegroundColor White
Write-Host "  📡 Backend API:   http://localhost:3005" -ForegroundColor White

Write-Host "`n📝 Process IDs for cleanup:" -ForegroundColor Yellow
Write-Host "  Backend: $($backend.Id)" -ForegroundColor White
Write-Host "  Admin:   $($admin.Id)" -ForegroundColor White
Write-Host "  VM-001:  $($vm001.Id)" -ForegroundColor White
Write-Host "  VM-002:  $($vm002.Id)" -ForegroundColor White

Write-Host "`n💡 To stop all services, run: Stop-all-uis.ps1" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to exit this script (services will continue running)" -ForegroundColor Magenta

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 30
        Write-Host "✅ All services running..." -ForegroundColor Green
    }
} catch [System.Management.Automation.PipelineStoppedException] {
    Write-Host "`n👋 Script interrupted. Services are still running." -ForegroundColor Yellow
}
