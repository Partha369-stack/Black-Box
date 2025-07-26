# 🚀 UI Deployment Guide

## 📋 Overview

Your Black Box project has 3 UI applications:
- **VM-001**: Vending Machine 1 Interface
- **VM-002**: Vending Machine 2 Interface  
- **Admin**: Admin Control Panel

## 🎯 Deployment Options

### Option 1: Railway (Recommended)

#### Why Railway?
- ✅ Same platform as your backend
- ✅ Easy integration with existing services
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Environment variables support

#### Deploy Steps:

1. **Create Railway Services:**
   ```bash
   # Go to railway.app
   # Create 3 new services:
   # - VM-001-UI
   # - VM-002-UI  
   # - Admin-UI
   ```

2. **Deploy VM-001:**
   ```bash
   cd VM-001
   npm run build
   # Connect to Railway and deploy
   ```

3. **Deploy VM-002:**
   ```bash
   cd VM-002
   npm run build
   # Connect to Railway and deploy
   ```

4. **Deploy Admin:**
   ```bash
   cd Admin
   npm run build
   # Connect to Railway and deploy
   ```

#### Railway Configuration:
Each UI has a `railway.json` file configured for deployment.

### Option 2: Vercel (Frontend Specialist)

#### Deploy Commands:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy VM-001
cd VM-001
npm run build
vercel --prod

# Deploy VM-002
cd VM-002
npm run build
vercel --prod

# Deploy Admin
cd Admin
npm run build
vercel --prod
```

### Option 3: Netlify (Easy Drag & Drop)

#### Deploy Steps:
1. Build each UI:
   ```bash
   cd VM-001 && npm run build
   cd ../VM-002 && npm run build
   cd ../Admin && npm run build
   ```

2. Go to [netlify.com](https://netlify.com)
3. Drag & drop each `dist` folder
4. Configure custom domains

### Option 4: GitHub Pages (Free)

#### Setup:
```bash
# Install gh-pages
npm i -g gh-pages

# Deploy VM-001
cd VM-001
npm run build
gh-pages -d dist

# Deploy VM-002
cd VM-002
npm run build
gh-pages -d dist

# Deploy Admin
cd Admin
npm run build
gh-pages -d dist
```

## 🔧 Build Configuration

### VM-001 Configuration:
- **Base Path**: `/vm-001`
- **Port**: 4173 (preview)
- **API Proxy**: `https://black-box-production.up.railway.app`

### VM-002 Configuration:
- **Base Path**: `/vm-002/`
- **Port**: 4174 (preview)
- **API Proxy**: `https://black-box-production.up.railway.app`

### Admin Configuration:
- **Base Path**: `/` (root)
- **Port**: 4175 (preview)
- **API Proxy**: `https://black-box-production.up.railway.app`

## 🌐 Expected URLs After Deployment

### Railway URLs:
- **VM-001**: `https://vm-001-ui.up.railway.app/vm-001`
- **VM-002**: `https://vm-002-ui.up.railway.app/vm-002/`
- **Admin**: `https://admin-ui.up.railway.app/`

### Custom Domain Setup:
You can configure custom domains like:
- **VM-001**: `https://vm1.yourcompany.com`
- **VM-002**: `https://vm2.yourcompany.com`
- **Admin**: `https://admin.yourcompany.com`

## 🧪 Testing Deployment

### Local Preview:
```bash
# Test VM-001
cd VM-001
npm run build
npm run preview
# Visit: http://localhost:4173/vm-001

# Test VM-002
cd VM-002
npm run build
npm run preview
# Visit: http://localhost:4174/vm-002/

# Test Admin
cd Admin
npm run build
npm run preview
# Visit: http://localhost:4175/
```

## 🔧 Environment Variables

### For Production Deployment:
Each UI needs these environment variables:

```bash
# VM-001 & VM-002
VITE_API_URL=https://black-box-production.up.railway.app
VITE_API_BASE_URL=https://black-box-production.up.railway.app

# Admin
VITE_API_URL=https://black-box-production.up.railway.app
VITE_API_BASE_URL=https://black-box-production.up.railway.app
VITE_WEBSOCKET_HOST=black-box-production.up.railway.app
```

## 🚀 Quick Deploy Script

Use the provided PowerShell script:
```powershell
.\deploy_all_uis.ps1
```

This will:
- ✅ Install dependencies
- ✅ Build all UIs
- ✅ Show deployment options
- ✅ Provide next steps

## 📋 Deployment Checklist

- [ ] Backend is deployed and working
- [ ] All UIs build successfully
- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] Custom domains configured (optional)
- [ ] HTTPS enabled
- [ ] Performance optimized

## 🎯 Recommended Deployment Strategy

1. **Start with Railway** (same platform as backend)
2. **Test thoroughly** with Railway URLs
3. **Add custom domains** once stable
4. **Consider CDN** for better performance
5. **Monitor** deployment health

Your UIs are now ready for production deployment! 🎉
