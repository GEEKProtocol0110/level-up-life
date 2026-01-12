# Level-Up Life - Implementation Complete ✨

## Project Overview

Level-Up Life is a family gamification app that helps parents encourage healthy behaviors in children through quests, XP rewards, and a rewards shop system.

## Architecture

### Tech Stack
- **Frontend (Web)**: Next.js 16 + React + TypeScript + TailwindCSS
- **Frontend (Mobile)**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Package Manager**: pnpm monorepo
- **Shared Libraries**: @level-up-life/api, @level-up-life/core, @level-up-life/ui

### Database Schema

**Core Tables:**
- `family` - Parent family groups
- `family_member` - Family membership with roles (parent, caregiver, child)
- `child_profile` - Child profiles with age tracking
- `child_account_link` - Links child profiles to auth accounts
- `quest` - Quest templates (academics, behavior, athletics, health, recipes, money, general)
- `quest_instance` - Daily/weekly quest instances with status tracking
- `xp_log` - Transaction log of all XP earned
- `reward` - Redeemable rewards (new quests earn XP → redeem for rewards)
- `reward_redemption` - Tracking of reward requests/approvals

**Key Features:**
- ✅ Row Level Security (RLS) on all tables
- ✅ Role-based access control (owner, parent, caregiver, child)
- ✅ Realtime subscriptions for live updates
- ✅ Updated_at triggers for audit trails
- ✅ Automatic XP aggregation via SQL function

## Features Implemented

### 1. Authentication & Multi-Role Access
- Email/password sign up and sign in
- Parent/caregiver and child login modes
- Session persistence (web + mobile)
- Protected dashboard routes

### 2. Family Management
- Create family groups
- Invite members with role assignment
- View family hierarchy and permissions

### 3. Child Profiles
- Create child profiles with birthdates
- Auto-calculate age
- Mode override (child/youth/adult/legacy)
- Link child account to auth user

### 4. Quest System
- Create quests across 7 domains (academics, behavior, athletics, health, recipes, money, general)
- Set difficulty (1-5 stars) and XP rewards
- Daily/weekly/monthly/yearly cadence
- Auto-generate quest instances
- Track quest status (pending, in_progress, completed, failed, skipped)

### 5. XP & Leveling
- Award XP on quest completion
- Aggregate XP by domain and total
- Level calculation: Level = floor(sqrt(XP/100)) + 1
- Transaction log with full history
- Realtime XP updates

### 6. Rewards Shop
- Create family-specific rewards
- Set XP cost for each reward
- Children can request rewards
- Parents approve/reject redemptions
- Emoji icons for visual appeal

### 7. Dashboard & UI
**Web App Pages:**
- `/auth` - Sign in/sign up
- `/dashboard` - Overview with stats
- `/dashboard/children` - Child profile management
- `/dashboard/children/[id]` - Individual child detail with quests
- `/dashboard/quests` - Quest creation and management
- `/dashboard/xp-history` - Transaction log
- `/dashboard/rewards` - Rewards shop management

**Mobile App:**
- Authentication flow
- Dashboard with child selector
- Quest completion interface
- XP tracking

### 8. Realtime Updates
- Live dashboard refresh on quest completion
- Automatic XP log updates
- Cross-device sync via Supabase Realtime

## Local Development

### Prerequisites
- Node.js 18+
- Docker (for local Supabase)
- pnpm

### Setup
```bash
# Install dependencies
pnpm install

# Start Supabase locally
supabase start

# Apply migrations
supabase db push

# Load seed data (optional)
docker exec -i supabase_db_level-up-life psql -U postgres postgres < supabase/seed.sql

# Start web dev server
cd apps/web && pnpm dev
# Visit http://localhost:3000

# Start mobile dev server (in separate terminal)
cd apps/mobile && pnpm dev
# Scan QR code with Expo Go app
```

### Test Credentials
- Email: `parent@example.com`
- Password: `password123`

### Local Supabase URLs
- Studio: http://127.0.0.1:54323
- API: http://127.0.0.1:54321
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

## Code Structure

```
level-up-life/
├── apps/
│   ├── web/              # Next.js web application
│   │   ├── app/          # App router pages
│   │   ├── hooks/        # useAuth, useSupabase, etc.
│   │   └── components/   # Reusable components
│   └── mobile/           # React Native Expo app
│       ├── app/          # Expo router navigation
│       └── lib/          # Supabase client config
├── packages/
│   ├── api/              # Supabase client & queries
│   ├── core/             # Level/XP calculation logic
│   ├── config/           # Shared tsconfig
│   └── ui/               # Reusable UI components
├── supabase/
│   ├── migrations/       # SQL migration files
│   └── config.toml       # Local Supabase config
└── turbo.json            # Monorepo build configuration
```

## Key Patterns

### Authentication Hook
```typescript
const { user, loading, signIn, signUp, signOut } = useAuth();
```

### Supabase Hook
```typescript
const supabase = useSupabase();
const { data } = await supabase.from('table').select('*');
```

### Realtime Subscriptions
```typescript
useRealtimeSubscription({
  table: 'quest_instance',
  event: 'UPDATE',
  onUpdate: () => queryClient.invalidateQueries()
});
```

## Security & RLS

All tables have Row Level Security (RLS) enabled:

- **Owner/Parent**: Can CRUD family, children, quests, rewards
- **Caregiver**: Can READ family data, CREATE/UPDATE quests and quest instances
- **Child (linked)**: Can READ their own quests and XP, REQUEST rewards
- **Public**: No access by default (auth required)

See [supabase/migrations/](supabase/migrations/) for full policy definitions.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Supabase cloud setup
- Vercel deployment (web)
- EAS deployment (mobile)
- Environment configuration
- Security checklist
- Monitoring setup

**Quick Start:**
```bash
# Push migrations to Supabase cloud
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# Deploy web to Vercel
cd apps/web
vercel --prod

# Deploy mobile via EAS
cd apps/mobile
eas build --platform ios
eas build --platform android
```

## Next Steps

### Phase 2 Features
- [ ] Notifications on quest completion/XP milestones
- [ ] Parent approval workflow for custom quests
- [ ] Achievement badges and streaks
- [ ] Weekly/monthly leaderboards
- [ ] Email notifications
- [ ] Dark mode support
- [ ] Analytics dashboard for parents
- [ ] Custom quest templates from community
- [ ] Chores vs. learning differentiation
- [ ] Multi-family support

### Performance Optimizations
- [ ] Add database indexes for slow queries
- [ ] Implement query result caching
- [ ] Image optimization for avatar uploads
- [ ] Lazy load dashboard components
- [ ] Edge function for batch operations

### Testing
- [ ] Unit tests for core XP logic
- [ ] E2E tests with Cypress
- [ ] API integration tests
- [ ] Mobile app testing

## Environment Variables

### Web (.env.local / .env.production.local)
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

### Mobile (.env)
```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

## Troubleshooting

### Supabase Connection Issues
```bash
# Check if Supabase is running
supabase status

# Restart Supabase
supabase stop
supabase start

# Check database
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Migration Errors
```bash
# View migration status
supabase migration list

# Reset local database
supabase db reset

# Push specific migration
supabase db push --dry-run
```

### Auth Issues
- Clear browser localStorage/cookies
- Check email verification settings in Supabase
- Verify CORS origins configured

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/quest-templates

# Make changes, commit
git add .
git commit -m "feat: add quest templates"

# Push and create PR
git push origin feature/quest-templates

# After review, merge to main
# Then deploy via CI/CD (GitHub Actions recommended)
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and test locally
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

## Support

- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for feature requests
- **Email**: hello@level-up-life.app (when deployed)

## License

MIT - See LICENSE file

---

**Last Updated**: January 12, 2026
**Status**: MVP Complete ✅
**Ready for Testing**: Yes
**Ready for Production**: Yes (with environment setup)
