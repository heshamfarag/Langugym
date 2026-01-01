# Quick Deploy Guide - Fix langugym.site

## 🚨 Problem Found

Your domain `langugym.site` is pointing to HostGator (`208.91.197.13`), but **your website is not deployed anywhere yet**.

## ✅ Build Status

Your site is built and ready in the `dist` folder!

## 🚀 Quick Deploy (Choose One Method)

---

## Method 1: Vercel Web (Easiest - No CLI needed)

### Step 1: Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign up or log in (free account)

### Step 2: Deploy
1. Click **"Add New Project"**
2. **Option A**: Connect GitHub (if your code is on GitHub)
   - Import your repository
   - Vercel will auto-detect settings
   
3. **Option B**: Drag & Drop (fastest)
   - Click "Deploy" → "Browse" or drag your `dist` folder
   - Upload the `dist` folder contents

### Step 3: Add Environment Variables
In project settings → Environment Variables, add:
```
VITE_SUPABASE_URL=https://cbjqvyharuapekbchnun.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je
VITE_GEMINI_API_KEY=AIzaSyCXJeDzIsGJOWnuocJWvWNg9fo8DH2mJVo
```

### Step 4: Add Domain
1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `langugym.site`
4. Vercel will show DNS records

### Step 5: Update DNS in HostGator
1. Log in to [HostGator cPanel](https://cpanel.hostgator.com)
2. Go to **Zone Editor**
3. Find `langugym.site`
4. Edit the A record:
   - **Delete**: `208.91.197.13`
   - **Add**: Vercel's IP (shown in Vercel dashboard)
5. Save

---

## Method 2: Vercel CLI (Command Line)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd /Users/heshamfaragalla/Downloads/langugym
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Link to existing? No
# - Project name? langugym
# - Directory? ./
# - Override? No

# 4. Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://cbjqvyharuapekbchnun.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je

vercel env add VITE_GEMINI_API_KEY
# Paste: AIzaSyCXJeDzIsGJOWnuocJWvWNg9fo8DH2mJVo

# 5. Redeploy with env vars
vercel --prod

# 6. Add domain
vercel domains add langugym.site
```

---

## Method 3: Netlify (Alternative)

### Step 1: Go to Netlify
1. Visit [netlify.com](https://netlify.com)
2. Sign up or log in

### Step 2: Deploy
1. Click **"Add new site"** → **"Deploy manually"**
2. Drag and drop your `dist` folder
3. Wait for deployment

### Step 3: Add Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Add all three variables (same as Vercel)

### Step 4: Add Domain & Update DNS
1. Go to **Domain settings**
2. Add `langugym.site`
3. Update DNS in HostGator with Netlify's records

---

## ⚠️ CRITICAL: After Domain is Live

### Configure Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://app.supabase.com/project/cbjqvyharuapekbchnun)
2. Navigate to **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   ```
   https://langugym.site
   https://langugym.site/**
   https://www.langugym.site
   https://www.langugym.site/**
   ```
4. Set **Site URL** to: `https://langugym.site`
5. **Save**

**This is REQUIRED for authentication to work!**

---

## ✅ Verification Checklist

After deployment:
- [ ] Site deployed to Vercel/Netlify
- [ ] Environment variables added
- [ ] Domain added in hosting platform
- [ ] DNS updated in HostGator
- [ ] Waited 5-10 minutes for DNS propagation
- [ ] Supabase redirect URLs configured
- [ ] SSL certificate issued (automatic)
- [ ] Tested `https://langugym.site` in browser
- [ ] Tested authentication (sign up/login)

---

## 🆘 Still Not Working?

1. **Check DNS Propagation**: [whatsmydns.net](https://www.whatsmydns.net)
2. **Check SSL**: Wait 10-30 minutes after DNS update
3. **Clear Browser Cache**: Try incognito mode
4. **Check Browser Console**: Look for errors

---

**Your site is built and ready! Just needs to be deployed.** 🚀

