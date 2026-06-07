# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint
```

There is no test suite. TypeScript strict-mode type checking is the primary correctness gate (`tsc --noEmit`).

## Environment variables required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_MONTHLY_PRICE_ID
STRIPE_YEARLY_PRICE_ID
RESEND_API_KEY
```

## Architecture overview

**GolfGives** is a subscription SaaS where golfers pay monthly/yearly to enter prize draws and support charities. Users enter up to 5 Stableford scores (1–45); the admin runs a monthly draw of 5 numbers; matching 3, 4, or 5 wins a share of the prize pool.

### Route groups and access control

| Group | Path | Access |
|---|---|---|
| Public | `app/(public)/` | Anyone |
| Auth | `app/login/`, `app/signup/`, `app/subscribe/` | Unauthenticated |
| Dashboard | `app/dashboard/` | Any authenticated user |
| Admin | `app/admin/` | `profiles.role === 'admin'` only (enforced in layout) |
| API | `app/api/` | See per-route auth |

Admin access is gated in [app/admin/layout.tsx](app/admin/layout.tsx) — it queries `profiles.role` and redirects non-admins. There is no middleware file; session refresh happens via `lib/supabase/middleware.ts`'s `updateSession()` if wired up.

### Supabase client selection

- **Client Components** → `lib/supabase/client.ts` (`createBrowserClient`)
- **Server Components / Route Handlers** → `lib/supabase/server.ts` (`createClient` with anon key, or `createAdminClient` with service role)
- **Stripe webhook / server-only singletons** → `lib/supabase/admin.ts` (`getAdminClient`, lazy singleton with service role, no cookie handling)

### Stripe integration

- Checkout and portal sessions: `app/api/stripe/checkout/route.ts`, `app/api/stripe/portal/route.ts`
- Subscription lifecycle (created/updated/deleted, payment_failed): `app/api/stripe/webhook/route.ts` — upserts into `subscriptions` table and sends emails via Resend
- Plans and prize pool constants are defined in `lib/stripe.ts`:
  - Monthly: £19.99 / Yearly: £199.99
  - 60% of subscription → prize pool
  - Pool splits: 5-match 40% + jackpot rollover, 4-match 35%, 3-match 25%
  - Minimum 10% of subscription → charity

### Draw engine

`lib/utils.ts` contains the draw logic:
- `generateRandomDraw()` — 5 unique numbers from 1–45
- `generateAlgorithmicDraw(allScores, totalUsers)` — weighted inverse of score frequency (rarer scores more likely drawn)
- `countMatches(userScores, drawnNumbers)` — determines prize tier
- `calculatePrizePools(totalPool, jackpotRollover)` — prize allocation per tier

Admin triggers draws via `app/api/admin/draws/route.ts` (simulate → preview numbers; publish → write `draw_results`, update `jackpot_ledger`, email all subscribers).

If no 5-match winner, the jackpot rolls over by inserting a new row in `jackpot_ledger`. The latest row in that table is the current jackpot amount.

### Database tables

`profiles`, `subscriptions`, `golf_scores`, `charities`, `draws`, `draw_results`, `winner_verifications`, `jackpot_ledger`, `charity_donations` — full type definitions in [types/database.ts](types/database.ts).

### Key utilities and components

- `lib/utils.ts` — `cn()` (clsx + tailwind-merge), `formatPounds()`, `formatCurrency()` (pence), `formatMonth()`, `currentMonth()`, draw engine functions
- `lib/email.ts` — Resend helpers: `sendDrawResultEmail`, `sendWinnerVerificationEmail`, `sendSubscriptionEmail`
- `components/ui/` — shared Button, Card, Badge, Input primitives
- `components/admin/DrawEngine.tsx` — client component for admin draw UI
- Path alias `@/*` maps to the repository root

### Styling

Tailwind CSS v4 with PostCSS. Dark theme with green accent (`#4ade80`), gold (`#d4a017`), and dark backgrounds (`#0a0f0d`, `#111816`). Custom CSS variables are set via `globals.css`. Use `cn()` from `lib/utils.ts` for conditional class merging.
