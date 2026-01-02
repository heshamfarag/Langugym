# Deploy LanguGym to Netlify

## 🚀 Quick Deploy Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Sign up or log in

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify

3. **Select Your Repository**
   - Find: `heshamfarag/langu-gym-app`
   - Click "Connect"

4. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - These are already configured in `netlify.toml`, so Netlify should auto-detect them

5. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add these variables:
     ```
     VITE_SUPABASE_URL=https://cbjqvyharuapekbchnun.supabase.co
     VITE_SUPABASE_ANON_KEY=sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je
     VITE_GEMINI_API_KEY=AIzaSyCXJeDzIsGJOWnuocJWvWNg9fo8DH2mJVo
     ```

6. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your site (takes 2-3 minutes)

7. **Update Supabase Redirect URLs**
   - Go to: https://app.supabase.com/project/cbjqvyharuapekbchnun
   - Authentication → URL Configuration
   - Add your Netlify URL:
     - `https://your-site-name.netlify.app`
     - `https://your-site-name.netlify.app/**`
   - If you have a custom domain, add that too

---

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Follow the prompts

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_SUPABASE_URL "https://cbjqvyharuapekbchnun.supabase.co"
   netlify env:set VITE_SUPABASE_ANON_KEY "sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je"
   netlify env:set VITE_GEMINI_API_KEY "AIzaSyCXJeDzIsGJOWnuocJWvWNg9fo8DH2mJVo"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

---

## 📋 Configuration Files

### `netlify.toml` (Already configured)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

This configuration:
- ✅ Builds your Vite app
- ✅ Publishes from `dist` folder
- ✅ Handles SPA routing (redirects all routes to index.html)
- ✅ Uses Node.js 20

---

## 🔗 Connect Custom Domain (langugym.site)

1. **In Netlify Dashboard**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter: `langugym.site`

2. **Update DNS at HostGator**
   - Go to HostGator cPanel → Zone Editor
   - Update DNS records:
     - **Type**: A or CNAME (Netlify will show which)
     - **Value**: Netlify's provided IP or domain
   - Netlify will show exact DNS values in the dashboard

3. **SSL Certificate**
   - Netlify automatically provisions SSL certificates
   - Wait 5-30 minutes after DNS update

4. **Update Supabase Redirect URLs**
   - Add `https://langugym.site` and `https://langugym.site/**`
   - Set Site URL to `https://langugym.site`

---

## 🔄 Continuous Deployment

Once connected to GitHub:
- ✅ Every push to `main` branch auto-deploys
- ✅ Preview deployments for pull requests
- ✅ Build logs available in dashboard

---

## 🆚 Netlify vs Vercel

**Netlify Advantages:**
- ✅ Free SSL certificates
- ✅ Built-in form handling
- ✅ Edge functions
- ✅ Split testing
- ✅ Better for static sites

**Migration Notes:**
- Both support Vite/React apps
- Both auto-detect build settings
- Environment variables work the same way
- Both support custom domains

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables set in Netlify
- [ ] Site builds successfully
- [ ] Supabase redirect URLs updated
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active
- [ ] Test authentication (sign up/login)
- [ ] Test all features work correctly

---

## 🆘 Troubleshooting

**Build fails?**
- Check build logs in Netlify dashboard
- Verify Node version (should be 20)
- Ensure all dependencies are in `package.json`

**Environment variables not working?**
- Make sure they start with `VITE_` prefix
- Redeploy after adding variables
- Check build logs for errors

**Routing issues?**
- Verify `netlify.toml` redirects are correct
- Check that `dist/index.html` exists after build

**Custom domain not working?**
- Wait 5-30 minutes for DNS propagation
- Check DNS records match Netlify's requirements
- Verify SSL certificate is active

---

**Ready to deploy? Start with Option 1 (Dashboard) - it's the easiest!** 🚀

