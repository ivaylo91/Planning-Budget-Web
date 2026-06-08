# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Пазарувай умно

Bulgarian-language grocery budget planner + promo aggregator (PWA). React + Vite + TypeScript + Tailwind v4, Supabase (Postgres + Auth) for persistence and cross-device sync. All UI copy is in Bulgarian; prices are formatted in EUR via `formatEUR()` in [src/lib/format.ts](src/lib/format.ts) — never hardcode currency strings.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) and production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build (PWA assets — `manifest.webmanifest`/`sw.js` — are only emitted here or in `build`, not in `dev`)
- `npm run ingest:promotions` — regenerate `public/data/promotions.csv` from `scripts/ingest_promotions.py` (requires a populated, gitignored `cvs/` directory of source price-disclosure CSVs)

**Typechecking gotcha:** the root `tsconfig.json` has `"files": []` with project references, so a bare `npx tsc --noEmit` silently checks nothing. Always run `npx tsc --noEmit -p tsconfig.app.json` to actually typecheck the app.

## Architecture

**Auth-gated SPA shell.** [src/main.tsx](src/main.tsx) wraps `<App />` in `<AuthProvider>` ([src/lib/auth.tsx](src/lib/auth.tsx)). [src/App.tsx](src/App.tsx) reads `useAuth()` and renders: a loading state, then `<AuthPage />` if signed out, then the routed app (bottom 5-tab nav + `react-router-dom` routes to the 5 pages in [src/pages/](src/pages/)) if signed in.

**Persistence is Supabase-backed, not localStorage.** [src/lib/sync.ts](src/lib/sync.ts) exports `useSyncedState<T>(key, fallback)`, a drop-in `[value, setValue]` hook that reads/writes one JSONB column (`budget` / `shopping_list` / `purchases`) on a single per-user row in the `user_data` table (RLS: `auth.uid() = user_id`), with 500ms-debounced upserts. Every page uses this instead of local component state for persisted data — there is no other persistence layer.

**Promotions come from a static CSV, not live scraping.** Billa/Lidl/Kaufland/Fantastiko/T Market/Metro/CBA don't expose APIs and publish promos as leaflets, so [scripts/ingest_promotions.py](scripts/ingest_promotions.py) (run via `npm run ingest:promotions`) transforms official government-mandated daily price-disclosure CSVs (in a gitignored `cvs/` dir) into [public/data/promotions.csv](public/data/promotions.csv) — deduping per product per chain by branch coverage, classifying into the app's Bulgarian category taxonomy via keyword matching (the source's numeric category codes are retailer-internal and don't align across chains), and synthesizing a rolling `validFrom`/`validTo` window since the source has no promo date ranges. [src/lib/promotions.ts](src/lib/promotions.ts) (`loadPromotions`/`isPromotionActive`/`findMatchingPromotions`/`discountPercent`) and [src/lib/csv.ts](src/lib/csv.ts) (hand-rolled RFC4180-ish parser) consume the generated CSV at runtime.

**Shopping list ↔ promotions linkage.** Typing an item name on the shopping list auto-suggests a matching active promo (`findMatchingPromotions`); applying it sets `referencePrice` (the promo's regular price) separately from `estimatedPrice`/`actualPrice` so "saved" reflects true regular-vs-promo savings. See the `ShoppingListItem`/`Promotion`/`PurchaseRecord` shapes in [src/lib/types.ts](src/lib/types.ts).

**Other lib modules:** [src/lib/period.ts](src/lib/period.ts) (budget period math — weekly/monthly windows anchored to `Budget.startDate`), [src/lib/notifications.ts](src/lib/notifications.ts) (Notification API wrapper with `notifyOnce` dedupe — budget-threshold and promo-match alerts), [src/lib/catalogVisuals.ts](src/lib/catalogVisuals.ts) (`categoryIcon`/`storeColor` substring-matchers mapping real CSV category/store strings to emojis/colors), [src/lib/icons.tsx](src/lib/icons.tsx) (Font Awesome wrapper preserving a hand-rolled `IconProps` API).

**Env:** Supabase client ([src/lib/supabase.ts](src/lib/supabase.ts)) reads `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` from a gitignored `.env` (typed in [src/vite-env.d.ts](src/vite-env.d.ts)).

## Design Context

This project has `PRODUCT.md` and `DESIGN.md` at the root (written via `/impeccable init` + `/impeccable document`).

- **Register:** product (app UI — design serves the budgeting/shopping workflow, not marketing)
- **North Star:** "The Warm Receipt" — one terracotta accent (`#e8712a`) carrying meaning (progress, savings, action) against calm paper-white neutrals; numbers are the hero
- **Strategic principles:** respect the money (clear numeric hierarchy), celebrate small wins subtly, built for frequent short visits (every interaction must feel immediate), Bulgarian-first not translated

Read `PRODUCT.md` (strategy: users, purpose, brand personality, anti-references) and `DESIGN.md` (visual system: colors, typography, components, do's/don'ts) before any design or UI work.
