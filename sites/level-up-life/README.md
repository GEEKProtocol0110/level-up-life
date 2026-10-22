# Level-Up Life — hosted parent/adult planner

A private adult/parent website with personal quests, parent-managed profiles, approval-based XP, and account saving. It runs on the supplied Sites Vinext/Cloudflare starter. The previous static-only introduction lives in the product repository under `apps/parent-site/`; this is the active hosted implementation.

## Run and validate

Install with the Sites skill’s dependency helper, or follow the retained starter tooling for standalone development. Node 24 is used for the test suite’s built-in SQLite adapter.

```sh
node --test tests/*.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Apply the generated `drizzle/0000_loose_lady_bullseye.sql` once to the local D1 database before previewing account storage. Hosted migrations are applied by Sites during publication. Migrations are schema-only; no table creation runs in request handlers.

## Accounts and data

The hosted site uses the adult visitor’s existing ChatGPT sign-in. API handlers read identity through the server-only `app/chatgpt-auth.ts` helper. The per-Site user ID is the owner key; email, full names, and authentication credentials are not stored in the planner database. The audience remains owner-private.

Each adult owns one validated plan document, including up to 20 profiles and 1,000 quests. Every read/write filters by the server-authenticated owner ID. A submitted owner ID has no authority. PUT requires a same-origin JSON request and an expected revision; conditional SQLite writes prevent concurrent devices from silently overwriting each other. Account APIs are private and non-cacheable.

All family profiles are managed by the adult. There are no child sessions or invitations to other adults in this version. Completing a managed quest places it in a pending state; XP is derived only from approved quests. XP has no cash value and is not a monetary reward ledger.

## Device plans and recovery

The older version-1 plan format is migrated without losing its quests or earned XP. Guest/device plans are kept separate from account plans and imported only through the explicit “Bring device plan” action. Account caches are namespaced by account ID. Failed saves stay dirty in the device cache and can be retried. A concurrent-edit conflict offers explicit saved-copy/device-copy choices and an export option.

JSON exports contain the entire plan, including profile nicknames and quests. Backup import is additive, validates the complete document, deduplicates quest IDs, and enforces plan limits.

## Architecture and boundaries

- `public/site/`: browser UI, shared plan validation, and sync controller.
- `app/api/session/`: optional ChatGPT identity and supported sign-in/sign-out links.
- `app/api/plan/`: authenticated route adapter.
- `lib/planner-api.mjs`: owner-scoped persistence and optimistic concurrency.
- `db/schema.ts`, `drizzle/`: D1 schema and generated migration.
- `tests/`: persistence/isolation, revision conflict, offline recovery, account separation, migration, and approval tests.

The existing Next.js/Expo/Supabase product is separate. This hosted site does not use Supabase credentials, does not provide cloud-to-Supabase migration, does not move money, and does not connect wallets. GitHub merges and Sites publication are separate operations.

## Validation limits

Automated persistence and browser tests cover the local implementation. Managed browser preview has mock sign-in disabled, so real ChatGPT login on the published origin and reopening the same account plan on a physical second device require a user smoke test. The UI exposes saving errors and does not claim failed writes succeeded.
