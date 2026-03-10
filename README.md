# cargo-web

Dealer web frontend repository.

## Status

- Next.js + TypeScript application skeleton bootstrapped
- App Router structure aligned with `AGENTS.md` and `docs/*`
- Dealer feature placeholders mapped for web-first expansion

## Stack

- Next.js App Router
- React
- TypeScript (`strict`)
- TanStack Query
- Zod
- Tailwind CSS

## Route Skeleton

- `/login`
- `/home`
- `/quote`
- `/chat`
- `/mypage`

## Auth Boundary

- `src/shared/auth/*` owns backend-specific auth adapters
- `src/app/api/auth/*` stays as a thin cookie/session boundary
- feature UI does not know whether auth is backed by Supabase or Spring

Current local setup can use the dealer Flutter app's Supabase connection values
through `.env.local`, while leaving the UI and route shell independent from that
provider choice.

## Architecture

```text
src/
  app/
  features/
  entities/
  shared/
```

Route files stay thin and feature logic lives under `src/features/*`.

## Getting Started

1. Copy `.env.example` to `.env.local`
2. Fill auth/backend values
3. `npm install`
4. `npm run dev`

## References

- `AGENTS.md`
- `docs/DEALER_APP_MIGRATION_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT_CONVENTION.md`
- `docs/ROUTING.md`
- `docs/TESTING.md`
