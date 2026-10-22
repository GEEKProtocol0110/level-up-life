> **Repository scope: Separate family progression prototype.** This is separate from the active [GEEK HQ](https://www.geekprotocol.xyz/) release. For current Geek learning and product behavior, use [geek-protocol-hq](https://github.com/GEEKProtocol0110/geek-protocol-hq) and its [current release status](https://github.com/GEEKProtocol0110/geek-protocol-hq/blob/main/docs/PROJECT-STATUS.md). Features described below belong to this project; this status note does not certify a production deployment.

# Level-Up Life

The active hosted adult/parent planner is in [sites/level-up-life](sites/level-up-life/README.md), with ChatGPT account saving, parent-managed profiles, quest approvals, and XP. The earlier device-only prototype is preserved in [apps/parent-site](apps/parent-site/README.md). The existing Next.js/Expo/Supabase application remains separate.

> **Gamified lifelong growth management** — A cross-platform RPG for families to build better habits, track progress, and celebrate milestones together.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20%2B-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)

## 🎮 Overview

Level-Up Life transforms personal development into an engaging, age-aware experience. Family members earn XP by completing quests, level up through life stages, and unlock features progressively as they grow.

### ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🧬 **Lifelong Profile** | Single account that evolves from childhood through adulthood with age-adaptive UI and features |
| 👨‍👩‍👧‍👦 **Family Management** | Parents manage child profiles; children can claim accounts as they mature |
| 🎯 **Quest System** | Daily, weekly, monthly, yearly goals with XP rewards across 7 life domains |
| 🔒 **Age-Gated Features** | Spending, wallet access, and capabilities unlock by age with progressive autonomy |
| 📊 **Domain Tracking** | Track progress in Academics, Behavior, Athletics, Health, Recipes, Money, & General |
| 🔐 **Role-Based Access** | Parent, caregiver, and child roles with RLS policies protecting family data |
| 📱 **Cross-Platform** | Native experience on Web (Next.js), iOS & Android (Expo) with real-time sync

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Web Frontend** | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| **Mobile** | Expo + React Native + TypeScript |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **State** | TanStack Query v5 + Zod validation |
| **Game Engine** | Custom TypeScript core (UI-agnostic) |

## 📂 Project Structure

```
level-up-life/
├── apps/                          # Applications
│   ├── web/                       # Next.js 16 web app
│   │   ├── app/                   # App Router pages & layouts
│   │   ├── public/                # Static assets
│   │   └── tsconfig.json          # Path aliases for @level-up-life/*
│   └── mobile/                    # Expo React Native app
│       ├── app/                   # Expo Router navigation
│       ├── components/            # Reusable components
│       └── lib/                   # Mobile-specific utilities (Supabase, storage)
│
├── packages/                      # Shared packages
│   ├── core/                      # Game engine (modes, XP, gates, periods)
│   │   ├── src/
│   │   │   ├── age.ts             # Age-to-mode calculations
│   │   │   ├── cadence.ts         # Quest period calculations
│   │   │   ├── gates.ts           # Feature unlock by age
│   │   │   ├── xp.ts              # XP & level calculations
│   │   │   └── types.ts           # Shared TypeScript definitions
│   │   └── tests/                 # 13+ test cases
│   ├── api/                       # Supabase integration layer
│   │   ├── src/
│   │   │   ├── client.ts          # Typed Supabase client factory
│   │   │   ├── database.types.ts  # Generated DB types
│   │   │   ├── schemas.ts         # Zod validators for API payloads
│   │   │   └── index.ts           # High-level helpers (families, children, quests, XP)
│   │   └── tsconfig.json          # Path alias for @level-up-life/core
│   ├── ui/                        # Shared React components (future)
│   └── config/                    # Shared TS, ESLint configurations
│
├── supabase/                      # Database & deployment
│   ├── migrations/
│   │   └── 20260111000000_initial_schema.sql  # Schema: families, children, quests, XP logs
│   └── config.toml                # Supabase local config
│
├── turbo.json                     # Turborepo pipeline (build, typecheck, lint, test)
├── pnpm-workspace.yaml            # Workspace root configuration
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org))
- **pnpm** 10+ (`npm install -g pnpm`)
- **Docker** (for Supabase local — [download Docker Desktop](https://www.docker.com/products/docker-desktop))

### 1. Clone & Install

```bash
git clone https://github.com/GEEKProtocol0110/level-up-life.git
cd level-up-life
pnpm install
```

### 2. Start Supabase Locally

```bash
# Initialize Supabase (one-time)
npx supabase init

# Start Supabase containers (Postgres, Auth, Storage, Studio)
npx supabase start

# Terminal output will show:
# Studio:          http://127.0.0.1:54323
# API URL:         http://127.0.0.1:54321
# Anon Key:        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Service Role:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stop when done
npx supabase stop
```

### 3. Configure Environment

Create `.env.local` in each app:

**apps/web/.env.local**:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_from_step_2>
```

**apps/mobile/.env.local**:
```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key_from_step_2>
```

### 4. Run the Apps

```bash
# Web (http://localhost:3000)
cd apps/web && pnpm dev

# Mobile (Expo CLI)
cd apps/mobile && pnpm start
# Press 'i' for iOS simulator, 'a' for Android emulator, or scan QR for device

# Run both simultaneously (from root)
pnpm dev
```

## 🛠️ Development Commands

### Monorepo Scripts

```bash
# Build all packages
pnpm build

# Type check all packages
pnpm typecheck

# Lint all packages (ESLint)
pnpm lint

# Test core package
pnpm --filter @level-up-life/core test
```

### Database Operations

```bash
# Create a new migration
npx supabase migration new <feature_name>

# Apply migrations to local DB
npx supabase db reset  # ⚠️ Clears all data

# Review schema changes
npx supabase db diff

# View Studio UI
# Open http://127.0.0.1:54323 in browser
```

### Package-Specific

```bash
# Core game engine tests
pnpm --filter @level-up-life/core test

# Web app dev
cd apps/web && pnpm dev

# Mobile app dev
cd apps/mobile && pnpm start
```

## 🎮 Game Mechanics

### Modes & Lifecycle

The app adapts to the user's age, but modes can be manually overridden:

| Mode | Age | Features | UI |
|------|-----|----------|-----|
| **Child** | 1–9 | Parent-managed only, simplified quests, parent approval for all actions | Large buttons, simple language, fun colors |
| **Youth** | 10–15 | Some autonomy, learning financial concepts, request-based spending | Age-appropriate UX, educational tone |
| **Adult** | 16+ | Full independence, real money features (if enabled), wallet access | Full-featured, professional UI |
| **Legacy** | Any | Reflection mode, mentorship, archive previous growth | Read-mostly, nostalgic |

### XP & Progression

- **XP Formula**: Next level requires `100 + currentLevel × 25` total XP
- **Quest Rewards**: Scale with difficulty (1–5 stars)
- **Example**: Difficulty-3 quest might award 30 XP; completing it ranks you up if you hit the threshold

### Feature Gates

Progressive autonomy unlocks by age:

| Feature | <7 | 7–12 | 13–15 | 16–17 | 18+ |
|---------|----|----|----|----|-----|
| **Earn Allowance** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Request Spending** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Policy-Based Spending** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **View Wallet** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Sim Wallet** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Real Wallet** | ❌ | ❌ | ❌ | ✅ | ✅ |

### Quests & Domains

Complete quests across 7 life domains to earn XP and unlock achievements:

- 📚 **Academics** — Homework, learning milestones, certifications
- 🎯 **Behavior** — Habits, social skills, emotional growth
- ⚽ **Athletics** — Exercise, sports, fitness goals
- 🧘 **Health** — Sleep, nutrition, wellness routines
- 🍳 **Recipes** — Cooking, meal prep, food safety
- 💰 **Money** — Allowance, budgeting, financial literacy
- 🎨 **General** — Personal projects, hobbies, creativity

## 🗄️ Database Schema

The schema supports the entire family lifecycle with role-based access:

### Tables

| Table | Purpose |
|-------|---------|
| `family` | Family group container (owner, name, metadata) |
| `family_member` | Users in a family (parent, caregiver, or child role) |
| `child_profile` | Child info (name, birthdate, mode override, avatar) |
| `child_account_link` | Links child profile to a user account when mature |
| `quest` | Quest templates (domain, difficulty, cadence, XP) |
| `quest_instance` | Individual quest attempts (status, completion date) |
| `xp_log` | Audit trail of all XP transactions |

### Security

- **Row-Level Security (RLS)**: Each user sees only their family's data
- **Role-Based Policies**: Parents can manage, children can view & complete
- **Age-Aware Enforcement**: System enforces gate logic via policies & backend validation

## 📈 Project Status

### Completed ✅

- [x] **Step A**: Monorepo scaffold (Turborepo, pnpm, TypeScript, ESLint)
- [x] **Step B**: App scaffolds (Next.js 16, Expo, shared configs)
- [x] **Step C**: Core engine (age modes, XP, gates, quest periods, 13 tests)
- [x] **Step D**: Supabase schema (migrations, RLS, database types, README)
- [x] **Step E**: End-to-end wiring (React Query, Supabase client, auth flows, family/quest/XP management)

### In Progress 🚧

- Family creation & management flows
- Quest generation & completion UI
- XP tracking & level progression display
- Mobile-specific optimizations

### Planned 🔮

- [ ] Achievement & badge system
- [ ] Domain-specific sub-features (recipes module, money tracking)
- [ ] Kaspa wallet integration (optional, non-custodial)
- [ ] Notifications & reminders
- [ ] Social features (leaderboards, challenges)
- [ ] Analytics & progress reports
- [ ] Production deployment (Vercel + Supabase)

## 📚 Documentation

- **Core Engine**: See [packages/core/README.md](packages/core/README.md) for game logic details
- **Database**: See [supabase/migrations/](supabase/migrations/) for schema definitions
- **API Helpers**: See [packages/api/src/index.ts](packages/api/src/index.ts) for Supabase integration layer

## 🤝 Contributing

Contributions are welcome! Please:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** with clear messages: `git commit -m "feat: add cool feature"`
4. **Push** and open a **Pull Request**

### Development Guidelines

- **TypeScript**: All code must pass `pnpm typecheck`
- **Linting**: All code must pass `pnpm lint`
- **Testing**: Add tests for new features in core package
- **Docs**: Update README for user-facing changes

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 💬 Support & Feedback

- **Issues**: [GitHub Issues](https://github.com/GEEKProtocol0110/level-up-life/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GEEKProtocol0110/level-up-life/discussions)
- **Email**: Open an issue for inquiries

---

<div align="center">

**Built with ❤️ by GEEKProtocol0110**

Made with Next.js • Expo • Supabase • TypeScript

</div>
