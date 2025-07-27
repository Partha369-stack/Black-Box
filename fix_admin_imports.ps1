# PowerShell script to fix @/lib/utils imports in Admin UI components
Write-Host "🔧 Fixing Admin UI imports..." -ForegroundColor Yellow

$uiComponentsPath = "Admin\src\components\ui"
$files = Get-ChildItem -Path $uiComponentsPath -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match '@/lib/utils') {
        Write-Host "Fixing imports in: $($file.Name)" -ForegroundColor Cyan
        $newContent = $content -replace '@/lib/utils', '../../lib/utils'
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "🎉 All imports fixed!" -ForegroundColor Green
