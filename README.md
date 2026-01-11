# Level-Up Life

A production-ready cross-platform RPG life-management app for the entire family (toddlers → adults → seniors).

## Overview

Level-Up Life gamifies personal development through quests, XP, achievements, and skill progression across multiple life domains:
- 📚 **Academics** - Learning and education
- 🎯 **Behavior** - Habits and character development  
- ⚽ **Athletics** - Physical activity and sports
- 🧘 **Health** - Sleep, nutrition, wellness
- 🍳 **Recipes** - Cooking and meal planning
- 💰 **Money** - Allowance, budgeting, financial literacy

### Key Features

- **Lifelong Profile**: One account that grows with you from childhood through adulthood
- **Hybrid Modes**: Auto-adjusts by age (child/youth/adult/legacy) with optional user override
- **Family Management**: Parent-managed child profiles that can evolve into independent accounts
- **Age-Appropriate Gates**: Spending, wallet access, and features unlock progressively with age
- **Quest System**: Daily, weekly, monthly, and yearly quests with XP rewards
- **Cross-Platform**: Unified experience across Web, iOS, and Android

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Web**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Mobile**: Expo + React Native + TypeScript
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Data**: TanStack Query + Zod validation
- **Core Engine**: UI-agnostic TypeScript package

## Project Structure

```
level-up-life/
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # Expo mobile application
├── packages/
│   ├── core/         # Game engine (XP, quests, modes, gates)
│   ├── api/          # Supabase helpers + Zod schemas
│   ├── ui/           # Shared components (optional)
│   └── config/       # Shared configs (TypeScript, ESLint)
├── supabase/
│   ├── migrations/   # Database schema migrations
│   └── config.toml   # Supabase configuration
└── turbo.json        # Turborepo pipeline configuration
```

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm 10+
- Docker (for Supabase local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/GEEKProtocol0110/level-up-life.git
cd level-up-life

# Install dependencies
pnpm install
```

### Running Supabase Locally

```bash
# Start Supabase (Postgres, Auth, Storage, Studio)
npx supabase start

# The terminal will display connection info:
# - Studio: http://127.0.0.1:54323
# - API URL: http://127.0.0.1:54321
# - Anon Key: (displayed in terminal)
# - Service Role Key: (displayed in terminal)

# To stop Supabase
npx supabase stop

# To reset the database (clears all data and reapplies migrations)
npx supabase db reset
```

### Environment Variables

Create `.env.local` files in both apps:

**apps/web/.env.local**:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_from_supabase_start>
```

**apps/mobile/.env.local**:
```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key_from_supabase_start>
```

### Running the Apps

```bash
# Run web app (dev mode with Turbopack)
pnpm web
# Opens at http://localhost:3000

# Run mobile app
pnpm mobile
# Follow Expo instructions to open on device/simulator

# Run both (if configured)
pnpm dev

# Run tests
pnpm --filter @level-up-life/core test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Development Workflow

### Database Migrations

```bash
# Create a new migration
npx supabase migration new <migration_name>

# Apply migrations
npx supabase db reset

# Check schema diff
npx supabase db diff
```

### Package Scripts

```bash
# Build all packages
pnpm build

# Type check all packages
pnpm typecheck

# Test core package
pnpm --filter @level-up-life/core test
```

## Core Game Mechanics

### Age & Modes

- **Child Mode** (1-9 years): Simplified UI, parent-managed
- **Youth Mode** (10-15 years): More autonomy, learning financial literacy
- **Adult Mode** (16+ years): Full features, independent management
- **Legacy Mode**: Optional mode for reflection and mentorship

Modes are auto-recommended by age but can be overridden (with parent approval for under-18 users).

### XP & Leveling

- XP required for next level: `100 + currentLevel * 25`
- Earn XP by completing quests
- XP scales with quest difficulty (1-5)

### Feature Gates

Age-based access control:
- **Allowance Earning**: Enabled at age 7+
- **Spending**: Request-only (<16), Policy-based (16-17), Full autonomy (18+)
- **Wallet**: Sim mode (<13), View (13-15), Real with policy (16-17), Full (18+)

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

TBD

## Roadmap

- [x] Monorepo setup with Turborepo
- [x] Core game engine (modes, XP, gates, quests)
- [x] Supabase schema with RLS policies
- [ ] Authentication flows (web + mobile)
- [ ] Family & child profile management
- [ ] Quest creation and completion
- [ ] XP tracking and level progression
- [ ] Domain-specific modules (academics, athletics, etc.)
- [ ] Achievements system
- [ ] Recipe uploads and meal planning
- [ ] Allowance and budgeting features
- [ ] Kaspa wallet integration (non-custodial, optional)

## Support

For issues or questions, please open a GitHub issue.
