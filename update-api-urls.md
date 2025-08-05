# 🔄 Update API URLs After Deployment

After your API server is deployed to Railway, you'll need to update the VM configuration files.

## 📝 **Files to Update**

### 1. Update VM-001 API Configuration
**File**: `VM-001/src/config/api.ts`

**Change Line 3** from:
```typescript
BASE_URL: 'https://black-box-production.up.railway.app',
```

**To your new API server URL**:
```typescript
BASE_URL: 'https://YOUR-API-SERVER.up.railway.app',
```

### 2. Update VM-002 API Configuration  
**File**: `VM-002/src/config/api.ts`

**Change Line 3** from:
```typescript
BASE_URL: 'https://black-box-production.up.railway.app',
```

**To your new API server URL**:
```typescript
BASE_URL: 'https://YOUR-API-SERVER.up.railway.app',
```

### 3. Update VM-001 Direct API Calls
**File**: `VM-001/src/pages/Index.tsx`

**Change Line 61** from:
```typescript
const res = await fetch(`https://black-box-production.up.railway.app/api/inventory`, {
```

**To**:
```typescript
const res = await fetch(`https://YOUR-API-SERVER.up.railway.app/api/inventory`, {
```

**Change Line 92** from:
```typescript
const res = await customFetch("https://black-box-production.up.railway.app/api/inventory/init", {
```

**To**:
```typescript
const res = await customFetch("https://YOUR-API-SERVER.up.railway.app/api/inventory/init", {
```

**Change Line 164** from:
```typescript
const response = await fetch('https://black-box-production.up.railway.app/api/orders', {
```

**To**:
```typescript
const response = await fetch('https://YOUR-API-SERVER.up.railway.app/api/orders', {
```

### 4. Update VM-002 (Same Changes)
Make identical changes in `VM-002/src/pages/Index.tsx` at the same line numbers.

## 🚀 **After Making Changes**

1. **Rebuild VM-001**:
   ```bash
   cd VM-001
   npm run build
   ```

2. **Rebuild VM-002**:
   ```bash
   cd VM-002
   npm run build
   ```

3. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Update API URLs to new Railway API server"
   git push origin main
   ```

4. **Redeploy VMs** on their respective Railway services

## ✅ **Verification**

After deployment, test:
- ✅ VM-001 loads inventory without 500 errors
- ✅ VM-002 loads inventory without 500 errors  
- ✅ No WebGL uniform warnings in console
- ✅ Smooth particle animations
- ✅ Order system works with QR codes
