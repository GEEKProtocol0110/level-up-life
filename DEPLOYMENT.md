# Deployment Guide - Level-Up Life

## 1. Supabase Cloud Setup

### Create Cloud Project
- Go to [Supabase Dashboard](https://app.supabase.com)
- Create new project (or use existing)
- Note the project URL and anon key

### Sync Database
```bash
# Login to Supabase CLI
supabase login

# Set remote connection
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to cloud
supabase db push
```

## 2. Environment Configuration

### Web App (.env.production.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Mobile App (.env.production)
```
EXPO_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Deploy Web App to Vercel

### Setup Vercel
```bash
npm install -g vercel
vercel login
cd apps/web
vercel
```

### Configure Environment
1. In Vercel dashboard, go to Settings → Environment Variables
2. Add production env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Deploy:
```bash
vercel --prod
```

## 4. Deploy Mobile App

### EAS Build (Recommended)
```bash
cd apps/mobile
npm install -g eas-cli
eas build --platform ios
eas build --platform android
eas submit --platform ios --latest
eas submit --platform android --latest
```

### Or Self-Hosted
- Build APK: `eas build --platform android --type apk`
- Upload to Google Play Store
- Build IPA for iOS and submit to App Store

## 5. Configure Supabase RLS & Auth

### Email Auth
1. Go to Supabase Dashboard → Authentication
2. Enable Email/Password provider
3. Configure email templates (optional)
4. Set redirect URLs:
   - Web: `https://yourdomain.com/auth/callback`
   - Mobile: `exp://yourdomain.com`

### Custom Domain (Optional)
```bash
# In Supabase dashboard, configure custom domain
# Point DNS CNAME to Supabase
```

## 6. Set Up CORS

### Supabase Settings
In Supabase dashboard:
1. Settings → API Settings
2. Add allowed origins:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   exp://yourdomain.com
   ```

## 7. Database Backups

### Enable Automatic Backups
1. Supabase Dashboard → Database → Backups
2. Enable daily/weekly backups
3. Set backup retention (min 7 days)

### Manual Backup
```bash
supabase db pull
# Creates backup in supabase/migrations/
```

## 8. Monitoring & Logging

### Enable Edge Function Logs
```bash
supabase functions deploy --dry-run
```

### Monitor Database
1. Supabase Dashboard → SQL Editor
2. Run: `SELECT * FROM pg_stat_statements LIMIT 20;`

### Monitor API Usage
1. Supabase Dashboard → Usage
2. Check request rates, storage, etc.

## 9. Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Service role key stored securely (not in frontend)
- [ ] Auth redirect URLs configured
- [ ] CORS origins configured
- [ ] Database backups enabled
- [ ] Secrets/API keys in environment variables
- [ ] Email verification enabled (optional)
- [ ] Rate limiting configured on Edge Functions
- [ ] Content Security Policy headers set
- [ ] HTTPS enforced

## 10. Post-Launch Tasks

### Monitoring
```bash
# Check logs
supabase functions list
supabase functions logs my-function

# Monitor errors in dashboard
```

### Performance
- Monitor slow queries in Supabase Dashboard
- Add indexes if needed (check migrations)
- Enable query caching for frequently accessed data

### Updates
```bash
# To push new migrations to production
supabase db push
# (Only push reviewed, tested migrations)
```

## Troubleshooting

### Auth not working
- Check redirect URLs in Supabase settings
- Verify CORS origins configured
- Check browser console for errors

### RLS blocking writes
- Review RLS policies in `supabase/migrations/`
- Use `EXPLAIN` in SQL editor to debug
- Check `auth.uid()` context

### Database connection errors
- Verify environment variables are set
- Check Supabase project status dashboard
- Test connection: `psql <DATABASE_URL>`

## Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Community](https://discord.supabase.io)
- [Vercel Docs](https://vercel.com/docs)
- [Expo Docs](https://docs.expo.dev)
