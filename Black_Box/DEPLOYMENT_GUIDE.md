# Black Box Landing Page - Deployment Guide

## Quick Fix for Railway Deployment

The deployment issue has been resolved. Here are the changes made:

### ✅ Issues Fixed:
1. **Import Path Resolution**: Changed relative imports to absolute imports using `@/` alias for better Docker compatibility
2. **Docker Configuration**: Created optimized Dockerfile for Railway deployment
3. **Build Configuration**: Ensured all dependencies are properly installed

### 🚀 Deploy to Railway

#### Option 1: Automatic Deployment (Recommended)
1. Push the latest changes to your GitHub repository (already done)
2. Go to your Railway dashboard
3. Trigger a new deployment or wait for automatic deployment
4. The build should now succeed!

#### Option 2: Manual Railway CLI Deploy
```bash
# Install Railway CLI (if not already installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy
railway up
```

### 🌐 Deploy to Other Platforms

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### 📋 Environment Variables

Make sure to set these environment variables in your deployment platform:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🔧 Local Development

To run locally:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 📁 Project Structure

```
src/
├── lib/
│   └── supabase.ts          # Supabase client and services
├── hooks/
│   └── useContactForm.ts    # Contact form logic
├── pages/
│   ├── LandingPage.tsx      # Main landing page
│   └── AdminDashboard.tsx   # Admin panel for inquiries
├── components/
│   └── ...                  # Reusable components
└── ...
```

### 🗄️ Database Setup

The Supabase database should have:
- `inquiries` table with proper RLS policies
- Anonymous insert permissions
- Authenticated read/update permissions

### 🎯 Features
- ✅ Responsive landing page
- ✅ Contact form with Supabase integration  
- ✅ Admin dashboard for inquiry management
- ✅ Animated logo effects
- ✅ Mobile-optimized design
- ✅ SEO-friendly
- ✅ Fast loading with optimized builds

### 🚨 Troubleshooting

If you encounter build issues:

1. **Clear Railway build cache**:
   - Go to Railway dashboard
   - Settings → Clear Build Cache
   - Redeploy

2. **Check environment variables**:
   - Ensure VITE_SUPABASE_* variables are set
   - Variables should be available at build time

3. **Verify latest code**:
   ```bash
   git status
   git push origin main
   ```

The deployment should now work smoothly! 🎉
