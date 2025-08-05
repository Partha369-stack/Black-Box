# 🚀 BlackBox Landing Page - Deployment Guide

## 📋 Pre-Deployment Checklist

✅ **Build Status**: Production build successful  
✅ **Supabase**: Database configured and working  
✅ **Environment Variables**: Configured for production  
✅ **Contact Form**: Tested and functional  
✅ **Admin Dashboard**: Available at `/admin`  

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select "BlackBox Landing Page" project

2. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://xgjdaavxwhvhcbycdbtv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnamRhYXZ4d2h2aGNieWNkYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzk5NzEsImV4cCI6MjA2ODUxNTk3MX0.z1T9qm9fZzItrCvjY0LslYHuHZ1dvG0FS3ypS3eKgCs
   ```

3. **Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy**: Click "Deploy" and your site will be live!

### Option 2: Netlify

1. **Connect Repository**:
   - Visit [netlify.com](https://netlify.com)
   - Import your GitHub repository

2. **Build Settings** (Auto-configured via `netlify.toml`):
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Environment Variables**:
   - Add the same Supabase variables as above

4. **Deploy**: Site will deploy automatically!

### Option 3: GitHub Pages

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions

2. **Push Code**: GitHub Actions will build and deploy automatically

## 🔧 Post-Deployment Setup

### 1. Custom Domain (Optional)
- **Vercel**: Project Settings → Domains
- **Netlify**: Site Settings → Domain Management

### 2. SSL Certificate
- Both Vercel and Netlify provide automatic HTTPS

### 3. Admin Dashboard Access
- Your admin panel will be available at: `your-domain.com/admin`
- Use this to manage website inquiries

## 📊 Analytics Setup (Optional)

### Google Analytics
Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🛡️ Security Considerations

- ✅ Environment variables properly configured
- ✅ Supabase RLS (Row Level Security) enabled
- ✅ API keys are public-safe (anon key only)
- ✅ HTTPS enforced by hosting platforms

## 📱 Features Available After Deployment

1. **Landing Page**: Complete with animations and responsive design
2. **Contact Form**: Saves to Supabase database
3. **Admin Dashboard**: Manage inquiries at `/admin`
4. **Mobile Responsive**: Works on all devices
5. **SEO Optimized**: Meta tags and structure

## 🔗 Live URLs

After deployment, you'll have:
- **Main Site**: `https://your-domain.com`
- **Admin Panel**: `https://your-domain.com/admin`

## 📞 Support

- **Email**: black369box@gmail.com
- **Phone**: +91 9163331360
- **Supabase Project**: [Dashboard](https://app.supabase.com/project/xgjdaavxwhvhcbycdbtv)

---

**🎉 Your BlackBox Landing Page is ready for the world!**
