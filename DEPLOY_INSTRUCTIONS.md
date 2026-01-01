# Deploy LanguGym to Vercel - Step by Step

## ✅ Your site is built and ready!

Build completed successfully. Files are in the `dist/` folder.

## 🚀 Deploy Now (Choose One Method)

---

## Method 1: Vercel Web Interface (Easiest - Recommended)

### Step 1: Go to Vercel
1. Open [vercel.com](https://vercel.com) in your browser
2. Sign up or log in (free account)

### Step 2: Deploy Your Project
1. Click **"Add New Project"**
2. **Option A - GitHub (Recommended)**:
   - Click "Import Git Repository"
   - Connect your GitHub account
   - Select your repository (or create one first)
   - Vercel will auto-detect settings
   
3. **Option B - Drag & Drop (Fastest)**:
   - Click "Deploy" → "Browse" or drag your `dist` folder
   - Upload the entire `dist` folder contents

### Step 3: Configure Project Settings
- **Framework Preset**: Vite (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)

### Step 4: Add Environment Variables
**CRITICAL** - Click "Environment Variables" and add:

```
VITE_SUPABASE_URL
https://cbjqvyharuapekbchnun.supabase.co

VITE_SUPABASE_ANON_KEY
sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je

VITE_GEMINI_API_KEY
AIzaSyCXJeDzIsGJOWnuocJWvWNg9fo8DH2mJVo
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes for deployment
3. You'll get a URL like `langugym-xyz.vercel.app`

### Step 6: Add Custom Domain
1. Go to your project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `langugym.site`
4. Click **"Add"**
5. Vercel will show DNS configuration

### Step 7: Update DNS in HostGator
1. Log in to [HostGator cPanel](https://cpanel.hostgator.com)
2. Go to **Zone Editor**
3. Find `langugym.site`
4. **Edit the A record**:
   - Delete: `208.91.197.13`
   - Add: Vercel's IP (shown in Vercel dashboard)
5. **Save changes**

### Step 8: Wait for DNS Propagation
- Usually takes 5-30 minutes
- Check at [whatsmydns.net](https://www.whatsmydns.net)

---

## Method 2: Vercel CLI (Command Line)

### Step 1: Login to Vercel
```bash
npx vercel login
```
Follow the prompts to authenticate in your browser.

### Step 2: Deploy
```bash
cd /Users/heshamfaragalla/Downloads/langugym
npx vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Link to existing project? **No**
- Project name? **langugym**
- Directory? **./** (press Enter)
- Override settings? **No**

### Step 3: Add Environment Variables
```bash
# Add Supabase URL
npx vercel env add VITE_SUPABASE_URL production
# Paste: https://cbjqvyharuapekbchnun.supabase.co

# Add Supabase Key
npx vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je

# Add Gemini API Key
npx vercel env add VITE_GEMINI_API_KEY production
# Paste: AIzaSyCXJeDzIsGJOWnuocJWvWNg9fo8DH2mJVo
```

### Step 4: Redeploy with Environment Variables
```bash
npx vercel --prod
```

### Step 5: Add Domain
```bash
npx vercel domains add langugym.site
```

Then update DNS in HostGator as described in Step 7 above.

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
5. **Save changes**

**This is REQUIRED for authentication to work on your live domain!**

---

## ✅ Verification

After deployment:
1. Visit your Vercel URL (e.g., `langugym-xyz.vercel.app`)
2. Test all features
3. After DNS updates, visit `https://langugym.site`
4. Test authentication

---

## 🆘 Troubleshooting

- **Build fails?** Check environment variables are set
- **Domain not working?** Wait for DNS propagation (up to 48 hours, usually 5-30 min)
- **SSL issues?** Vercel auto-generates SSL, wait 10-30 minutes after DNS update
- **Auth not working?** Make sure Supabase redirect URLs are configured

---

**Ready to deploy! Choose Method 1 (Web) for easiest setup.** 🚀

