# 🚂 Railway Backend Environment Variables

## 📋 **Complete Environment Variables List for Railway Deployment**

Copy and paste these environment variables into your Railway project's **Variables** section.

---

## 🔧 **Core Backend Configuration**

```bash
# Server Configuration
PORT=3005
API_KEY=blackbox-api-key-2024
ENVIRONMENT=production
DEBUG=false

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False
WEB_CONCURRENCY=1
```

---

## 💳 **Razorpay Payment Configuration (REQUIRED)**

```bash
# Razorpay API Credentials
RAZORPAY_KEY_ID=rzp_test_03GDDKe1yQVSCT
RAZORPAY_KEY_SECRET=g732gEWlZd8M0OB8DjGYCWns

# Razorpay API Base URL (Optional - uses default if not set)
RAZORPAY_API_BASE_URL=https://api.razorpay.com/v1
```

---

## 🗄️ **Supabase Database Configuration**

```bash
# Supabase Database
SUPABASE_URL=https://xgjdaavxwhvhcbycdbtv.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnamRhYXZ4d2h2aGNieWNkYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzk5NzEsImV4cCI6MjA2ODUxNTk3MX0.z1T9qm9fZzItrCvjY0LslYHuHZ1dvG0FS3ypS3eKgCs
```

---

## 🌐 **CORS and Frontend Configuration**

```bash
# Frontend URLs (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:8081,http://localhost:8083,http://localhost:8084,http://localhost:8085
```

---

## 📱 **Tenant/Machine Configuration**

```bash
# Default Tenant Configuration
TENANT_ID=VM-001
DEFAULT_MACHINE_ID=VM-001
```

---

## 🔐 **Security Configuration**

```bash
# Security Keys
SECRET_KEY=your-secret-key-for-flask-sessions
JWT_SECRET_KEY=your-jwt-secret-key-here
```

---

## 📊 **Logging and Monitoring**

```bash
# Logging Configuration
LOG_LEVEL=INFO
ENABLE_LOGGING=true
```

---

## 🚀 **Railway Specific Configuration**

```bash
# Railway Platform Variables (Auto-set by Railway)
RAILWAY_ENVIRONMENT=production
RAILWAY_PROJECT_NAME=black-box-production
```

---

## 📝 **Step-by-Step Setup Instructions**

### 1. **Access Railway Dashboard**
   - Go to [railway.app](https://railway.app)
   - Open your `black-box-production` project

### 2. **Navigate to Variables**
   - Click on your backend service
   - Go to **Variables** tab

### 3. **Add Environment Variables**
   - Click **+ New Variable**
   - Copy each variable name and value from above
   - **MOST IMPORTANT:** Set these first:
     ```
     RAZORPAY_KEY_ID=rzp_test_03GDDKe1yQVSCT
     RAZORPAY_KEY_SECRET=g732gEWlZd8M0OB8DjGYCWns
     ```

### 4. **Deploy Changes**
   - Railway will automatically redeploy when you add variables
   - Wait for deployment to complete

### 5. **Verify Setup**
   - Use the debug page: `check_railway_credentials.html`
   - Test QR generation to ensure Razorpay works

---

## ✅ **Priority Variables (Set These First)**

**CRITICAL for QR Code Generation:**
```bash
RAZORPAY_KEY_ID=rzp_test_03GDDKe1yQVSCT
RAZORPAY_KEY_SECRET=g732gEWlZd8M0OB8DjGYCWns
```

**REQUIRED for Basic Operation:**
```bash
PORT=3005
API_KEY=blackbox-api-key-2024
SUPABASE_URL=https://xgjdaavxwhvhcbycdbtv.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnamRhYXZ4d2h2aGNieWNkYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzk5NzEsImV4cCI6MjA2ODUxNTk3MX0.z1T9qm9fZzItrCvjY0LslYHuHZ1dvG0FS3ypS3eKgCs
```

---

## 🧪 **Testing After Setup**

After setting the variables:

1. **Test Credentials:**
   ```
   GET https://black-box-production.up.railway.app/debug/razorpay
   ```

2. **Test QR Generation:**
   ```
   POST https://black-box-production.up.railway.app/api/test/qr-generation
   Headers: X-Tenant-ID: VM-001
   ```

3. **Expected Result:**
   - ✅ Real Razorpay QR codes with `rzp.io` URLs
   - ❌ No more placeholder QR codes

---

## 🔄 **After Setting Variables**

1. **Railway will auto-redeploy** your service
2. **Wait 2-3 minutes** for deployment to complete
3. **Test QR generation** using your VM-001 app
4. **Verify** you get real Razorpay QR codes

---

## 🆘 **Troubleshooting**

If QR codes still don't work after setting variables:

1. **Check Railway Logs:**
   - Go to Railway dashboard → Deployments → View Logs
   - Look for Razorpay-related errors

2. **Verify Variables:**
   - Ensure no extra spaces in variable values
   - Check that RAZORPAY_KEY_ID starts with `rzp_test_`

3. **Test Debug Endpoint:**
   - Use `check_railway_credentials.html` to verify setup

---

**🎯 Priority: Set the Razorpay credentials first, then test QR generation!**
