# 🧪 Test Your Railway Deployment

Once you get your Railway URL, test these endpoints:

## 1. Health Check
```bash
curl https://your-app-name.railway.app/api/health
```
**Expected Response:**
```json
{"status": "healthy", "timestamp": "2024-01-XX..."}
```

## 2. Machine Status
```bash
curl -H "X-Tenant-ID: VM-001" https://your-app-name.railway.app/api/machine/status
```
**Expected Response:**
```json
{"id": "VM-001", "status": "online", "lastHeartbeat": "...", "simulated": true}
```

## 3. Inventory Check
```bash
curl -H "X-Tenant-ID: VM-001" https://your-app-name.railway.app/api/inventory
```
**Expected Response:**
```json
{"success": true, "inventory": [...]}
```

## 4. Dashboard Stats
```bash
curl -H "X-Tenant-ID: VM-001" -H "X-API-Key: blackbox-api-key-2024" https://your-app-name.railway.app/api/dashboard/stats
```

## If Tests Fail:

### Check Railway Logs:
1. Go to Railway dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on latest deployment
5. Check logs for errors

### Common Issues:
- **Environment variables not set correctly**
- **Supabase connection issues**
- **Port configuration problems**
- **Dependencies missing**

### Fix Steps:
1. Verify all environment variables are set
2. Check Supabase URL and key are correct
3. Ensure PORT is set to Railway's assigned port
4. Check build logs for dependency issues
