# 🚀 Railway Backend Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository with your code
- Supabase project set up

## Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

## Step 2: Deploy to Railway

1. **Go to Railway Dashboard:**
   - Visit https://railway.app
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"

2. **Connect Repository:**
   - Select your GitHub repository
   - Choose the `Backend` folder as the root directory

3. **Configure Environment Variables:**
   Go to your project settings and add these environment variables:
   
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   API_KEY=blackbox-api-key-2024
   PORT=3005
   WEB_CONCURRENCY=1
   FLASK_ENV=production
   FLASK_DEBUG=False
   ```

   Optional (if using Razorpay):
   ```
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

## Step 3: Configure Build Settings

Railway should automatically detect your Python app, but you can verify:

- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn --config gunicorn_config.py index:app`
- **Port:** `3005` (or Railway's assigned PORT)

## Step 4: Deploy

1. Click "Deploy" in Railway dashboard
2. Wait for build to complete
3. Railway will provide you with a public URL like: `https://your-app-name.railway.app`

## Step 5: Test Deployment

Test your deployed backend:
```bash
curl https://your-app-name.railway.app/api/health
```

Should return:
```json
{"status": "healthy", "timestamp": "..."}
```

## Step 6: Update Frontend Configuration

Once deployed, update your frontend environment variables:
```
VITE_API_URL=https://your-app-name.railway.app
```

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check requirements.txt has all dependencies
   - Verify Python version compatibility

2. **App Crashes:**
   - Check Railway logs in dashboard
   - Verify environment variables are set correctly

3. **CORS Errors:**
   - Add your frontend URL to FRONTEND_URL environment variable
   - Check CORS configuration in index.py

### Logs:
View logs in Railway dashboard or via CLI:
```bash
railway logs
```

## 🎯 Next Steps

After successful backend deployment:
1. Note down your Railway backend URL
2. Deploy frontend to Vercel
3. Update frontend to use Railway backend URL
4. Test full application flow

## 📝 Files Created for Deployment:
- `Backend/railway.json` - Railway configuration
- `Backend/Procfile` - Process definition
- `Backend/.env.example` - Environment variables template
- `Backend/gunicorn_config.py` - Production server config (already optimized)

Your backend is now ready for Railway deployment! 🚀
