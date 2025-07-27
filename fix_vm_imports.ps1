# PowerShell script to fix all @/ imports in VM-001 and VM-002
Write-Host "🔧 Fixing VM imports for Railway deployment..." -ForegroundColor Yellow

function Fix-Imports {
    param(
        [string]$vmPath
    )
    
    Write-Host "📁 Processing $vmPath..." -ForegroundColor Cyan
    
    # Get all TypeScript files
    $files = Get-ChildItem -Path $vmPath -Filter "*.tsx" -Recurse
    $files += Get-ChildItem -Path $vmPath -Filter "*.ts" -Recurse
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        
        # Skip if no @/ imports
        if ($content -notmatch '@/') {
            continue
        }
        
        Write-Host "  🔄 Fixing: $($file.Name)" -ForegroundColor White
        
        # Calculate relative path depth based on file location
        $relativePath = $file.FullName.Replace($vmPath, "").Replace("\", "/")
        $depth = ($relativePath.Split("/").Length - 2)
        $backPath = "../" * $depth
        
        # Fix common imports based on file location
        if ($file.DirectoryName -like "*\components\ui") {
            # UI components are 2 levels deep: src/components/ui/
            $content = $content -replace '@/lib/utils', '../../lib/utils'
            $content = $content -replace '@/lib/api', '../../lib/api'
            $content = $content -replace '@/components/', '../'
            $content = $content -replace '@/hooks/', '../../hooks/'
        }
        elseif ($file.DirectoryName -like "*\components") {
            # Components are 1 level deep: src/components/
            $content = $content -replace '@/lib/utils', '../lib/utils'
            $content = $content -replace '@/lib/api', '../lib/api'
            $content = $content -replace '@/components/', './'
            $content = $content -replace '@/hooks/', '../hooks/'
        }
        elseif ($file.DirectoryName -like "*\pages") {
            # Pages are 1 level deep: src/pages/
            $content = $content -replace '@/lib/utils', '../lib/utils'
            $content = $content -replace '@/lib/api', '../lib/api'
            $content = $content -replace '@/components/', '../components/'
            $content = $content -replace '@/hooks/', '../hooks/'
        }
        elseif ($file.DirectoryName -like "*\hooks") {
            # Hooks are 1 level deep: src/hooks/
            $content = $content -replace '@/lib/utils', '../lib/utils'
            $content = $content -replace '@/lib/api', '../lib/api'
            $content = $content -replace '@/components/', '../components/'
        }
        else {
            # Root src level
            $content = $content -replace '@/lib/utils', './lib/utils'
            $content = $content -replace '@/lib/api', './lib/api'
            $content = $content -replace '@/components/', './components/'
            $content = $content -replace '@/hooks/', './hooks/'
            $content = $content -replace '@/pages/', './pages/'
        }
        
        # Write back if changed
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "    ✅ Fixed imports in $($file.Name)" -ForegroundColor Green
        }
    }
}

# Fix VM-001
if (Test-Path "VM-001") {
    Fix-Imports -vmPath "VM-001"
} else {
    Write-Host "❌ VM-001 directory not found" -ForegroundColor Red
}

# Fix VM-002
if (Test-Path "VM-002") {
    Fix-Imports -vmPath "VM-002"
} else {
    Write-Host "❌ VM-002 directory not found" -ForegroundColor Red
}

Write-Host "`n🎉 Import fixing complete!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test builds: npm run build" -ForegroundColor White
Write-Host "  2. Commit changes: git add . and git commit -m 'Fix imports'" -ForegroundColor White
Write-Host "  3. Push to GitHub: git push origin main" -ForegroundColor White
