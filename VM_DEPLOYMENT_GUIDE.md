# 🚀 VM-001 & VM-002 Deployment Guide

## ✅ **DEPLOYMENT READY STATUS**

Both VM-001 and VM-002 are now **100% ready for deployment**!

### **✅ Pre-Deployment Checklist Completed:**
- [x] Build configurations optimized
- [x] Environment variables configured for production
- [x] API endpoints pointing to Railway backend
- [x] Base paths configured correctly
- [x] Railway deployment configs ready
- [x] Build tests passed
- [x] Preview servers tested

---

## 🎯 **Quick Deployment (Recommended: Railway)**

### **Step 1: Create Railway Services**
1. Go to [railway.app](https://railway.app)
2. Create **2 new services**:
   - `VM-001-UI`
   - `VM-002-UI`

### **Step 2: Deploy VM-001**
```bash
cd VM-001
# Build is already done, just deploy
# Connect to Railway and deploy the VM-001 folder
```

### **Step 3: Deploy VM-002**
```bash
cd VM-002
# Build is already done, just deploy
# Connect to Railway and deploy the VM-002 folder
```

### **Step 4: Configure Environment Variables**
Each service needs these environment variables:

**VM-001 Environment Variables:**
```bash
VITE_API_URL=https://black-box-production.up.railway.app
VITE_API_BASE_URL=https://black-box-production.up.railway.app
VITE_API_KEY=blackbox-api-key-2024
VITE_MACHINE_ID=VM-001
VITE_TENANT_ID=VM-001
VITE_ENVIRONMENT=production
VITE_DEBUG=false
VITE_RAZORPAY_KEY_ID=rzp_test_03GDDKe1yQVSCT
VITE_WEBSOCKET_HOST=black-box-production.up.railway.app
```

**VM-002 Environment Variables:**
```bash
VITE_API_URL=https://black-box-production.up.railway.app
VITE_API_BASE_URL=https://black-box-production.up.railway.app
VITE_API_KEY=blackbox-api-key-2024
VITE_MACHINE_ID=VM-002
VITE_TENANT_ID=VM-002
VITE_ENVIRONMENT=production
VITE_DEBUG=false
VITE_RAZORPAY_KEY_ID=rzp_test_03GDDKe1yQVSCT
VITE_WEBSOCKET_HOST=black-box-production.up.railway.app
```

---

## 🌐 **Expected Deployment URLs**

After deployment, your VMs will be accessible at:
- **VM-001**: `https://vm-001-ui.up.railway.app/vm-001/`
- **VM-002**: `https://vm-002-ui.up.railway.app/vm-002/`

---

## 🧪 **Local Testing (Already Working)**

Your VMs are currently running locally and ready for testing:
- **VM-001**: http://localhost:4173/vm-001/
- **VM-002**: http://localhost:4174/vm-002/

---

## 🔧 **Technical Configuration**

### **VM-001 Configuration:**
- **Base Path**: `/vm-001/`
- **Build Output**: `VM-001/dist/`
- **Preview Port**: 4173
- **Health Check**: `/vm-001/`

### **VM-002 Configuration:**
- **Base Path**: `/vm-002/`
- **Build Output**: `VM-002/dist/`
- **Preview Port**: 4174
- **Health Check**: `/vm-002/`

### **Railway Configuration Files:**
Both VMs have `railway.json` configured:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "healthcheckPath": "/vm-001/", // or /vm-002/
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

---

## 🚀 **Alternative Deployment Options**

### **Option 2: Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy VM-001
cd VM-001
vercel --prod

# Deploy VM-002
cd VM-002
vercel --prod
```

### **Option 3: Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop `VM-001/dist` folder → Deploy as VM-001
3. Drag & drop `VM-002/dist` folder → Deploy as VM-002
4. Configure environment variables in Netlify dashboard

### **Option 4: GitHub Pages**
```bash
# Install gh-pages
npm i -g gh-pages

# Deploy VM-001
cd VM-001
gh-pages -d dist

# Deploy VM-002
cd VM-002
gh-pages -d dist
```

---

## 🎉 **Features Ready for Production**

### **VM-001 Features:**
- ✅ Product catalog with real-time inventory
- ✅ Shopping cart functionality
- ✅ Razorpay QR code payment integration
- ✅ Payment verification via webhooks
- ✅ Order management
- ✅ Responsive design
- ✅ Error handling and fallbacks

### **VM-002 Features:**
- ✅ Enhanced UI with improved QR code display
- ✅ All VM-001 features plus visual improvements
- ✅ Better payment flow UX
- ✅ Optimized performance

---

## 🔍 **Post-Deployment Testing**

After deployment, test these key features:
1. **Product Loading**: Verify products load from Railway backend
2. **Add to Cart**: Test cart functionality
3. **Payment Flow**: Test Razorpay QR code generation
4. **Order Completion**: Verify webhook payment processing
5. **Error Handling**: Test offline scenarios

---

## 📞 **Support & Troubleshooting**

If you encounter issues:
1. Check Railway logs for build/deployment errors
2. Verify environment variables are set correctly
3. Test API connectivity to backend
4. Check browser console for frontend errors

**Your VMs are production-ready! 🚀**
