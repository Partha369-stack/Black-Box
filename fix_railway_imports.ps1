# PowerShell script to fix Railway build by embedding cn function directly
Write-Host "🔧 Fixing Railway build - Embedding cn function directly..." -ForegroundColor Yellow

$cnFunction = @'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
'@

function Fix-UIComponent {
    param(
        [string]$filePath
    )
    
    if (-not (Test-Path $filePath)) {
        return
    }
    
    $content = Get-Content $filePath -Raw
    
    # Skip if already has embedded cn function
    if ($content -match "function cn\(") {
        Write-Host "  Already fixed: $(Split-Path $filePath -Leaf)" -ForegroundColor Green
        return
    }

    # Skip if no cn import
    if ($content -notmatch 'import.*cn.*from') {
        return
    }

    Write-Host "  Fixing: $(Split-Path $filePath -Leaf)" -ForegroundColor White

    # Remove the cn import line
    $content = $content -replace 'import \{ cn \} from ".*"', ''
    $content = $content -replace "import \{ cn \} from '.*'", ''
    
    # Find the position after the last import
    $lines = $content -split "`n"
    $lastImportIndex = -1
    
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -match '^import ') {
            $lastImportIndex = $i
        }
    }
    
    if ($lastImportIndex -ge 0) {
        # Insert cn function after last import
        $beforeImports = $lines[0..$lastImportIndex] -join "`n"
        $afterImports = $lines[($lastImportIndex + 1)..($lines.Length - 1)] -join "`n"
        $newContent = $beforeImports + "`n`n" + $cnFunction + "`n" + $afterImports
    } else {
        # No imports found, add at the beginning
        $newContent = $cnFunction + "`n`n" + $content
    }
    
    # Write back the fixed content
    Set-Content -Path $filePath -Value $newContent -NoNewline
    Write-Host "    Fixed: $(Split-Path $filePath -Leaf)" -ForegroundColor Green
}

# Fix VM-001 UI components
Write-Host "`n📁 Processing VM-001 UI components..." -ForegroundColor Cyan
$vm1Files = Get-ChildItem -Path "VM-001/src/components/ui" -Filter "*.tsx" -ErrorAction SilentlyContinue
foreach ($file in $vm1Files) {
    Fix-UIComponent -filePath $file.FullName
}

# Fix VM-002 UI components
Write-Host "`n📁 Processing VM-002 UI components..." -ForegroundColor Cyan
$vm2Files = Get-ChildItem -Path "VM-002/src/components/ui" -Filter "*.tsx" -ErrorAction SilentlyContinue
foreach ($file in $vm2Files) {
    Fix-UIComponent -filePath $file.FullName
}

Write-Host "`nRailway import fixing complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test builds: npm run build in both VM folders" -ForegroundColor White
Write-Host "  2. Commit changes: git add . and git commit -m Fix Railway imports" -ForegroundColor White
Write-Host "  3. Push to GitHub: git push origin main" -ForegroundColor White
Write-Host "`nThis should resolve the Railway Docker build issues!" -ForegroundColor Green
