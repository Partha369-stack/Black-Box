#!/bin/bash

echo "🔧 Fixing all Admin import paths..."

# Fix layout component imports
find src/components/layout -name "*.tsx" -exec sed -i 's|../components/ui/|../ui/|g' {} \;
find src/components/layout -name "*.tsx" -exec sed -i 's|../hooks/|../../hooks/|g' {} \;
find src/components/layout -name "*.tsx" -exec sed -i 's|../lib/|../../lib/|g' {} \;

# Fix dashboard component imports  
find src/components/dashboard -name "*.tsx" -exec sed -i 's|../components/ui/|../ui/|g' {} \;
find src/components/dashboard -name "*.tsx" -exec sed -i 's|../lib/|../../lib/|g' {} \;

# Fix any remaining @/ imports
find src -name "*.tsx" -exec sed -i 's|@/|./|g' {} \;
find src -name "*.ts" -exec sed -i 's|@/|./|g' {} \;

# Fix specific common patterns
find src -name "*.tsx" -exec sed -i 's|"./components/ui/|"../components/ui/|g' {} \;
find src -name "*.tsx" -exec sed -i 's|"./hooks/|"../hooks/|g' {} \;
find src -name "*.tsx" -exec sed -i 's|"./lib/|"../lib/|g' {} \;
find src -name "*.tsx" -exec sed -i 's|"./pages/|"../pages/|g' {} \;

echo "✅ All import paths fixed!"
