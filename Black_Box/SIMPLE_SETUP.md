# 🚀 Black Box - Simple Contact Form Setup

## What This Is
A simple landing page with a contact form that saves submissions to Supabase. No admin panel, no authentication - just a clean contact form.

## 🔧 Quick Setup (2 Steps)

### Step 1: Fix Supabase Database
Go to your [Supabase SQL Editor](https://app.supabase.com/project/xgjdaavxwhvhcbycdbtv/sql/new) and run this:

```sql
-- Simple RLS policies for contact form only
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON inquiries;
DROP POLICY IF EXISTS "Allow public read access" ON inquiries;
DROP POLICY IF EXISTS "Allow public update access" ON inquiries;
DROP POLICY IF EXISTS "Allow public delete access" ON inquiries;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON inquiries;
DROP POLICY IF EXISTS "Allow authenticated read" ON inquiries;
DROP POLICY IF EXISTS "Allow authenticated update" ON inquiries;
DROP POLICY IF EXISTS "Allow authenticated insert" ON inquiries;
DROP POLICY IF EXISTS "Allow contact form submissions" ON inquiries;
DROP POLICY IF EXISTS "Allow service role all operations" ON inquiries;

-- ONLY allow contact form submissions
CREATE POLICY "Allow contact form submissions" ON inquiries
FOR INSERT TO anon
WITH CHECK (true);

-- Allow you to view data in Supabase dashboard
CREATE POLICY "Allow service role all operations" ON inquiries
FOR ALL TO service_role
USING (true)
WITH CHECK (true);
```

### Step 2: Deploy
Your environment variables are already set:
- `VITE_SUPABASE_URL=https://xgjdaavxwhvhcbycdbtv.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Just deploy to your platform:

**Vercel:**
```bash
npm run build
vercel --prod
```

**Netlify:**
```bash
npm run build
netlify deploy --prod
```

**Railway:**
Push to GitHub - it will auto-deploy.

## ✅ What Works Now
- ✅ Landing page with contact form
- ✅ Form submissions save to Supabase
- ✅ No 401 errors
- ✅ Simple and clean
- ✅ Mobile responsive

## 📊 View Your Data
Check submissions in your [Supabase Dashboard](https://app.supabase.com/project/xgjdaavxwhvhcbycdbtv/editor/inquiries)

## 🎯 Features Removed
- ❌ Admin dashboard (you manage data directly in Supabase)
- ❌ Authentication
- ❌ Complex routing
- ❌ Debug tools

## 📁 Project Structure (Simplified)
```
src/
├── lib/
│   └── supabase.ts          # Simple contact service
├── hooks/
│   └── useContactForm.ts    # Contact form logic
├── pages/
│   ├── LandingPage.tsx      # Main page
│   ├── PrivacyPolicy.tsx    # Legal pages
│   ├── TermsOfService.tsx
│   └── CookiePolicy.tsx
└── components/              # UI components
```

## 🚨 That's It!
Your Black Box landing page is now a simple, working contact form. No more 401 errors, no complexity - just what you need.

---
**Need help?** Check your Supabase project dashboard for form submissions.
