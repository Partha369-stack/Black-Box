# PowerShell script to build and deploy all UIs
Write-Host "🚀 Building and Deploying All UIs" -ForegroundColor Green

# Function to build a UI
function Build-UI {
    param($UIName, $Path)
    
    Write-Host "📦 Building $UIName..." -ForegroundColor Yellow
    Set-Location $Path
    
    # Install dependencies if node_modules doesn't exist
    if (!(Test-Path "node_modules")) {
        Write-Host "📥 Installing dependencies for $UIName..." -ForegroundColor Cyan
        npm install
    }
    
    # Build the project
    Write-Host "🔨 Building $UIName..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $UIName built successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ $UIName build failed!" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ..
}

# Build all UIs
$originalLocation = Get-Location

try {
    # Build VM-001
    Build-UI "VM-001" "VM-001"
    
    # Build VM-002
    Build-UI "VM-002" "VM-002"
    
    # Build Admin Panel
    Build-UI "Admin Panel" "Admin"
    
    Write-Host "🎉 All UIs built successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Deploy VM-001: Push VM-001 folder to Railway" -ForegroundColor White
    Write-Host "2. Deploy VM-002: Push VM-002 folder to Railway" -ForegroundColor White
    Write-Host "3. Deploy Admin: Push Admin folder to Railway" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Or use other deployment options:" -ForegroundColor Yellow
    Write-Host "- Vercel: npm run build && vercel --prod" -ForegroundColor White
    Write-Host "- Netlify: npm run build && netlify deploy --prod --dir=dist" -ForegroundColor White
    Write-Host "- GitHub Pages: npm run build && gh-pages -d dist" -ForegroundColor White
    
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Set-Location $originalLocation
}
