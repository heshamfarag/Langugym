# Domain Setup Guide for langugym.site

This guide will help you connect your custom domain `langugym.site` to your deployed website.

## Prerequisites

- Your website must be deployed on Vercel or Netlify
- You must have access to your domain registrar (where you purchased langugym.site)
- Your domain should be ready to configure

---

## Option 1: Using Vercel (Recommended)

### Step 1: Deploy Your Site to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL` = `https://cbjqvyharuapekbchnun.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je`
   - `VITE_GEMINI_API_KEY` = `AIzaSyCXJeDzIsGJOWnuocJWvWNg9fo8DH2mJVo`
5. Click "Deploy"

### Step 2: Add Custom Domain in Vercel

1. Go to your project dashboard on Vercel
2. Click on **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `langugym.site`
5. Click **Add**

### Step 3: Configure DNS Records

Vercel will show you the DNS records you need to add. You'll need to add one of these:

**Option A: A Record (Recommended)**
- Type: `A`
- Name: `@` (or leave blank)
- Value: `76.76.21.21` (Vercel's IP - check your Vercel dashboard for the exact IP)

**Option B: CNAME Record**
- Type: `CNAME`
- Name: `@` (or `www`)
- Value: `cname.vercel-dns.com` (or the CNAME shown in Vercel dashboard)

### Step 4: Add DNS Records at Your Domain Registrar

1. Log in to your domain registrar (where you bought langugym.site)
2. Go to DNS Management / DNS Settings
3. Add the DNS record(s) shown in Vercel
4. Save changes

### Step 5: Wait for DNS Propagation

- DNS changes can take 24-48 hours, but usually work within a few minutes
- Vercel will automatically issue an SSL certificate once DNS is configured
- You can check status in Vercel dashboard

---

## Option 2: Using Netlify

### Step 1: Deploy Your Site to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL` = `https://cbjqvyharuapekbchnun.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je`
   - `VITE_GEMINI_API_KEY` = `AIzaSyCXJeDzIsGJOWnuocJWvWNg9fo8DH2mJVo`
6. Click "Deploy site"

### Step 2: Add Custom Domain in Netlify

1. Go to your site dashboard on Netlify
2. Click **Domain settings** → **Add custom domain**
3. Enter: `langugym.site`
4. Click **Verify**

### Step 3: Configure DNS Records

Netlify will show you DNS records. Add these at your domain registrar:

**For Root Domain (langugym.site):**
- Type: `A`
- Name: `@` (or leave blank)
- Value: `75.2.60.5` (Netlify's IP - check Netlify dashboard for exact IP)

**OR use CNAME:**
- Type: `CNAME`
- Name: `@`
- Value: `langugym-site.netlify.app` (your Netlify site URL)

### Step 4: Add DNS Records at Your Domain Registrar

1. Log in to your domain registrar
2. Go to DNS Management
3. Add the DNS record(s) from Netlify
4. Save changes

---

## Important: Update Supabase Redirect URLs

After your domain is live, you **MUST** update Supabase to allow authentication from your new domain:

1. Go to [Supabase Dashboard](https://app.supabase.com/project/cbjqvyharuapekbchnun)
2. Navigate to **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   - `https://langugym.site`
   - `https://langugym.site/**`
   - `https://www.langugym.site` (if you set up www)
4. Add to **Site URL**:
   - `https://langugym.site`
5. Save changes

This is **critical** for Google OAuth and email authentication to work!

---

## Verify Domain Setup

1. Wait 5-10 minutes after adding DNS records
2. Visit `https://langugym.site` in your browser
3. You should see your LanguGym app
4. Test authentication to ensure Supabase redirects work

---

## Troubleshooting

### Domain Not Working?

1. **Check DNS Propagation**: Use [whatsmydns.net](https://www.whatsmydns.net) to check if DNS has propagated
2. **Verify DNS Records**: Make sure records are correct at your registrar
3. **Check SSL Certificate**: Vercel/Netlify should auto-generate SSL. Wait a few minutes if it's still pending
4. **Clear Browser Cache**: Try incognito mode or clear cache

### Authentication Not Working?

1. **Check Supabase Redirect URLs**: Make sure `https://langugym.site` is added
2. **Check Environment Variables**: Verify all env vars are set correctly in your hosting platform
3. **Check Browser Console**: Look for any errors

### Still Having Issues?

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Netlify Support**: [netlify.com/support](https://www.netlify.com/support)
- **Domain Registrar**: Contact your domain provider's support

---

## Quick Checklist

- [ ] Website deployed on Vercel or Netlify
- [ ] Custom domain added in hosting platform
- [ ] DNS records added at domain registrar
- [ ] DNS propagated (check with whatsmydns.net)
- [ ] SSL certificate issued (automatic)
- [ ] Supabase redirect URLs updated
- [ ] Test authentication on live domain
- [ ] Website accessible at https://langugym.site

---

## Common Domain Registrars

If you need help finding DNS settings, here are common registrars:

- **HostGator**: cPanel → Zone Editor (see [HOSTGATOR_DNS_SETUP.md](./HOSTGATOR_DNS_SETUP.md) for detailed instructions)
- **Namecheap**: Domain List → Manage → Advanced DNS
- **GoDaddy**: My Products → DNS → Manage DNS
- **Google Domains**: DNS → Custom records
- **Cloudflare**: DNS → Records
- **Name.com**: Domain Management → DNS Records

## HostGator Users

If your domain is hosted on HostGator (like `langugym.site`), see **[HOSTGATOR_DNS_SETUP.md](./HOSTGATOR_DNS_SETUP.md)** for specific step-by-step instructions with screenshots and exact DNS records to use.

---

**Need Help?** Check your hosting platform's documentation or support for domain-specific instructions.

