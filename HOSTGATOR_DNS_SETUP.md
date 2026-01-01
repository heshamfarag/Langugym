# HostGator DNS Setup for langugym.site

Your domain `langugym.site` is currently hosted on HostGator. Here's how to connect it to Vercel or Netlify.

## Current DNS Configuration

Your domain currently points to:
- **A Record**: `208.91.197.13` (HostGator server)
- **Nameservers**: HostGator (HGNS1.HOSTGATOR.COM, HGNS2.HOSTGATOR.COM)

## Option 1: Connect to Vercel (Recommended)

### Step 1: Deploy to Vercel First

1. Deploy your site to Vercel (if not already done)
2. Get your Vercel deployment URL (e.g., `langugym-xyz.vercel.app`)

### Step 2: Add Domain in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `langugym.site`
5. Click **Add**
6. Vercel will show you the DNS records you need

### Step 3: Update DNS in HostGator

1. **Log in to HostGator cPanel**:
   - Go to [cpanel.hostgator.com](https://cpanel.hostgator.com)
   - Or access via your HostGator account dashboard

2. **Navigate to DNS Zone Editor**:
   - In cPanel, search for "Zone Editor" or "DNS Zone Editor"
   - Click on it

3. **Find your domain** `langugym.site` in the list

4. **Update the A Record**:
   - Find the A record for `@` (or `langugym.site`)
   - **Delete** the current A record pointing to `208.91.197.13`
   - **Add new A record**:
     - **Name**: `@` (or leave blank for root domain)
     - **TTL**: `3600` (or default)
     - **Type**: `A`
     - **Address**: `76.76.21.21` (Vercel's IP - **check your Vercel dashboard for the exact IP**)

5. **Update WWW subdomain** (optional but recommended):
   - Find or create A record for `www`
   - **Name**: `www`
   - **TTL**: `3600`
   - **Type**: `A`
   - **Address**: `76.76.21.21` (same Vercel IP)

   **OR use CNAME** (recommended for www):
   - **Name**: `www`
   - **TTL**: `3600`
   - **Type**: `CNAME`
   - **Address**: `cname.vercel-dns.com` (or the CNAME shown in Vercel)

6. **Save changes**

### Step 4: Verify in Vercel

- Vercel will automatically detect the DNS changes
- SSL certificate will be issued automatically (may take a few minutes)
- Check status in Vercel dashboard → Domains

---

## Option 2: Connect to Netlify

### Step 1: Deploy to Netlify First

1. Deploy your site to Netlify
2. Get your Netlify site URL (e.g., `langugym-site.netlify.app`)

### Step 2: Add Domain in Netlify

1. Go to your Netlify site dashboard
2. Click **Domain settings** → **Add custom domain**
3. Enter: `langugym.site`
4. Click **Verify**

### Step 3: Update DNS in HostGator

1. **Log in to HostGator cPanel**
2. **Navigate to DNS Zone Editor**
3. **Find your domain** `langugym.site`

4. **Update the A Record**:
   - Delete the current A record (`208.91.197.13`)
   - Add new A record:
     - **Name**: `@`
     - **TTL**: `3600`
     - **Type**: `A`
     - **Address**: `75.2.60.5` (Netlify's IP - **check Netlify dashboard for exact IP**)

5. **Update WWW subdomain**:
   - **Name**: `www`
   - **TTL**: `3600`
   - **Type**: `CNAME`
   - **Address**: `langugym-site.netlify.app` (your Netlify site URL)

6. **Save changes**

---

## Important: Update Supabase Redirect URLs

**After your domain is live**, update Supabase:

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

This is **critical** for Google OAuth and email authentication to work!

---

## DNS Records Summary

### For Vercel:
```
Type: A
Name: @
Value: 76.76.21.21 (check Vercel dashboard for exact IP)

Type: CNAME (or A)
Name: www
Value: cname.vercel-dns.com (or Vercel IP)
```

### For Netlify:
```
Type: A
Name: @
Value: 75.2.60.5 (check Netlify dashboard for exact IP)

Type: CNAME
Name: www
Value: langugym-site.netlify.app (your Netlify site URL)
```

---

## Step-by-Step: HostGator cPanel

1. **Login**: Go to [cpanel.hostgator.com](https://cpanel.hostgator.com)
2. **Search**: Type "Zone Editor" in the search box
3. **Select Domain**: Click on `langugym.site`
4. **Edit Records**: 
   - Click the **pencil icon** to edit existing records
   - Or click **Add Record** to create new ones
5. **Delete Old Records**: Remove the A record pointing to `208.91.197.13`
6. **Add New Records**: Add the records shown above
7. **Save**: Click **Save Zone File** or **Save Record**

---

## Verification

1. **Wait 5-10 minutes** after updating DNS
2. **Check DNS Propagation**: 
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter `langugym.site`
   - Check if A record shows the new IP
3. **Test Website**: 
   - Visit `https://langugym.site`
   - You should see your LanguGym app
4. **Test Authentication**: 
   - Try signing up/logging in
   - Verify Google OAuth works (if configured)

---

## Troubleshooting

### DNS Not Updating?

- **Wait longer**: DNS can take up to 48 hours (usually 5-30 minutes)
- **Clear DNS cache**: 
  - Windows: `ipconfig /flushdns`
  - Mac: `sudo dscacheutil -flushcache`
  - Or use a different network/device
- **Check TTL**: Make sure TTL is set to 3600 or lower for faster updates

### SSL Certificate Not Issuing?

- **Wait**: SSL certificates auto-generate but can take 10-30 minutes
- **Check hosting dashboard**: Vercel/Netlify will show SSL status
- **Verify DNS**: Make sure DNS is correctly pointing to hosting platform

### Authentication Not Working?

- **Check Supabase Redirect URLs**: Must include `https://langugym.site`
- **Check Environment Variables**: Verify all are set in hosting platform
- **Check Browser Console**: Look for errors

### Still Having Issues?

- **HostGator Support**: [support.hostgator.com](https://support.hostgator.com)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Netlify Support**: [netlify.com/support](https://www.netlify.com/support)

---

## Quick Checklist

- [ ] Site deployed on Vercel or Netlify
- [ ] Domain added in hosting platform dashboard
- [ ] Old A record (208.91.197.13) deleted in HostGator
- [ ] New A record added with hosting platform IP
- [ ] WWW subdomain configured (CNAME or A record)
- [ ] DNS changes saved in HostGator
- [ ] Waited 5-10 minutes for DNS propagation
- [ ] Supabase redirect URLs updated
- [ ] SSL certificate issued (check hosting dashboard)
- [ ] Website accessible at https://langugym.site
- [ ] Authentication tested and working

---

**Note**: Your domain will stop pointing to HostGator once you update the DNS records. Make sure your website is deployed and working on Vercel/Netlify before making DNS changes!

