# 🚀 Level Up Life - Production Deployment Guide

## Prerequisites Checklist

- [ ] Supabase account (sign up at https://supabase.com)
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] GitHub account (you have this!)

---

## Part 1: Setup Supabase Cloud Database

### Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Sign in with GitHub

2. **Create New Project**
   - Click **"New Project"** button
   - **Project Name:** `level-up-life-prod`
   - **Database Password:** [Create strong password - SAVE THIS!]
   - **Region:** Choose closest to you (e.g., `us-east-1`, `eu-west-1`)
   - Click **"Create new project"**
   - ⏱️ Wait ~2 minutes for provisioning

3. **Get Your API Credentials**
   
   Once project is ready:
   - Go to **Settings** (⚙️ icon) → **API**
   - Copy these values:
     ```
     Project URL: https://xxxxxxxxxxxxx.supabase.co
     anon public key: eyJhbGc....[long key]
     ```
   - 📝 Save these somewhere safe!

### Step 2: Get Your Project Reference ID

Still in Supabase dashboard:
- Go to **Settings** → **General**
- Find **Reference ID** (looks like: `abcdefghijklmnop`)
- 📝 Copy this!

### Step 3: Link Local Project to Cloud

Back in your terminal:

```bash
cd /workspaces/level-up-life

# Login to Supabase CLI
# Get access token from: https://supabase.com/dashboard/account/tokens
# Click "Generate new token" → Copy it

export SUPABASE_ACCESS_TOKEN="your_token_here"

# Link to your cloud project
supabase link --project-ref YOUR_REFERENCE_ID

# Verify connection
supabase projects list
```

### Step 4: Push Database Migrations

```bash
# This will create all tables, RLS policies, etc. in production
supabase db push

# Verify migrations applied
supabase db remote list
```

### Step 5: (Optional) Add Seed Data for Testing

If you want test users in production:

```bash
# Push seed data to production
supabase db reset --db-url "postgresql://postgres:[YOUR_DB_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"
```

⚠️ **Warning:** Only do this for testing! Don't use seed data in real production.

---

## Part 2: Deploy to Vercel

### Method A: Vercel GitHub Integration (Recommended)

1. **Go to Vercel**
   - Open: https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository**
   - Click **"Add New..."** → **"Project"**
   - Find `GEEKProtocol0110/level-up-life`
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `apps/web`
   - **Build Command:** `pnpm build` (or use default)
   - **Output Directory:** `.next` (default)

4. **Add Environment Variables**
   
   Click **"Environment Variables"** and add:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc....` |
   
   - Apply to: **Production, Preview, Development**
   - Click **"Add"** for each

5. **Deploy!**
   - Click **"Deploy"**
   - ⏱️ Wait ~2-3 minutes
   - 🎉 Your app will be live at: `https://level-up-life-xxxx.vercel.app`

### Method B: Vercel CLI

```bash
cd /workspaces/level-up-life/apps/web

# Login to Vercel
npx vercel login

# Deploy to production
npx vercel --prod

# When prompted, answer:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? level-up-life
# - Directory? ./ (current)
# - Override settings? No
```

Then add environment variables:

```bash
# Add Supabase URL
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Add Supabase anon key
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Redeploy with new env vars
npx vercel --prod
```

---

## Part 3: Setup Auto-Deploy on Git Push

If you used Vercel GitHub integration, this is automatic! Every push to `main` branch will trigger a deployment.

### To Configure:

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Git**
3. Verify:
   - ✅ **Production Branch:** `main`
   - ✅ **Automatic deployments:** Enabled
   - ✅ **Deploy hooks:** Available for manual triggers

---

## Part 4: Verify Deployment

### Test Your Production App

1. **Visit your Vercel URL:** `https://level-up-life-xxxx.vercel.app`

2. **Create a Test Account**
   - Go to `/auth`
   - Sign up with email/password
   - You should be redirected to dashboard

3. **Test Core Features**
   - [ ] Create a family
   - [ ] Add a child
   - [ ] Create a quest
   - [ ] Assign quest to child
   - [ ] Mark quest complete
   - [ ] Verify XP appears
   - [ ] Create reward
   - [ ] Redeem reward

### Check Supabase Data

1. Go to Supabase dashboard → **Table Editor**
2. Verify tables populated:
   - `family` - your family record
   - `child_profile` - your children
   - `quest` - created quests
   - `xp_log` - XP transactions

---

## Troubleshooting

### "Failed to connect to database"
- Verify environment variables in Vercel are correct
- Check Supabase project is active (not paused)
- Confirm API keys match your project

### "Access denied" or RLS policy errors
- Check RLS policies are enabled in Supabase
- Verify user is authenticated properly
- Test auth flow manually

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Verify `apps/web/package.json` has correct dependencies
- Try building locally: `cd apps/web && pnpm build`

### TypeScript errors during build
- These are expected and ignored via `next.config.ts`
- Build should still succeed

---

## Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Go to Vercel → Settings → Domains
   - Add your domain (e.g., `leveluplife.app`)
   - Follow DNS setup instructions

2. **Analytics** (Optional)
   - Vercel Analytics: Enable in project settings
   - Or add Google Analytics, Plausible, etc.

3. **Error Monitoring** (Optional)
   - Add Sentry: `pnpm add @sentry/nextjs`
   - Or use Vercel's built-in monitoring

4. **Performance Monitoring**
   - Check Vercel Speed Insights
   - Review Lighthouse scores
   - Optimize images and assets

5. **Mobile App** (See separate guide)
   - Build with EAS: `cd apps/mobile && eas build`
   - Submit to App Store / Play Store

---

## 🎉 You're Live!

Your app is now deployed and accessible worldwide! Share the URL with users and start collecting feedback.

**Production URL:** https://level-up-life-xxxx.vercel.app  
**Supabase Dashboard:** https://supabase.com/dashboard/project/YOUR_REF  
**Vercel Dashboard:** https://vercel.com/YOUR_USERNAME/level-up-life

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Project Issues:** https://github.com/GEEKProtocol0110/level-up-life/issues
