<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1LgakBdwoVZudTq5_GxOA3rGMaoi19fM7

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   
   Create a `.env.local` file in the root directory with the following:
   ```env
   # Supabase Configuration
   # Get these from: https://app.supabase.com → Your Project → Settings → API
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key-here
   
   # Gemini API Key (for AI features)
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
   
   **Getting Supabase Credentials:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project (or create a new one)
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** → use as `VITE_SUPABASE_URL`
   - Copy the **anon/public** or **publishable** key → use as `VITE_SUPABASE_ANON_KEY`

3. Set up the database:
   
   After starting the app, if you see a "Database Setup Required" dialog:
   - Copy the SQL code shown
   - Go to your Supabase Dashboard → **SQL Editor**
   - Paste and run the SQL to create the required tables
   - Click "Retry" in the app

4. Run the app:
   ```bash
   npm run dev
   ```

## Supabase Setup

The app uses Supabase for:
- **Authentication** (email/password and Google OAuth)
- **Database** (user profiles, words, stories, progress)
- **Row Level Security** (RLS) for data protection

### Database Tables

The app requires the following tables:
- `profiles` - User statistics and settings
- `user_words` - Vocabulary words and learning progress
- `stories` - User-imported stories
- `orders` - Payment/order tracking (if applicable)

All tables are automatically created when you run the SQL from the Database Setup dialog.

## Deploy to the Web

Your app is ready to deploy! Here are the easiest options:

### Option 1: Deploy to Vercel (Recommended - Easiest)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `VITE_SUPABASE_URL` = `https://cbjqvyharuapekbchnun.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je`
     - `GEMINI_API_KEY` = (your Gemini API key)
   - Click "Deploy"
   - Your site will be live in ~2 minutes! 🚀

### Option 2: Deploy to Netlify

1. **Push your code to GitHub** (same as above)

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings (auto-detected):
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables in Site settings → Environment variables:
     - `VITE_SUPABASE_URL` = `https://cbjqvyharuapekbchnun.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je`
     - `GEMINI_API_KEY` = (your Gemini API key)
   - Click "Deploy site"

### Option 3: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### Important Notes for Deployment:

- ✅ **Environment Variables**: Make sure to add all environment variables in your hosting platform's dashboard
- ✅ **Supabase Redirect URLs**: Add your production URL to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
- ✅ **Database**: Your Supabase database is already set up and ready to use
- ✅ **HTTPS**: Both Vercel and Netlify provide free SSL certificates

## Connect Custom Domain (langugym.site)

To connect your custom domain `langugym.site` to your deployed website:

1. **Deploy your site** using one of the options above (Vercel or Netlify)
2. **Add custom domain** in your hosting platform's dashboard
3. **Configure DNS records** at your domain registrar (see [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for detailed instructions)
4. **Update Supabase Redirect URLs**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add `https://langugym.site` and `https://langugym.site/**` to Redirect URLs
   - Set Site URL to `https://langugym.site`

📖 **Full domain setup guide**: See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for step-by-step instructions.

### Quick Deploy Commands:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```
