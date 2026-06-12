---
name: Пазарувай умно
description: A calm, confident grocery-budgeting PWA — bold Grotesk numbers floating on cool silver-grey surfaces inside double-bezel frames, with a single warm terracotta accent for progress, savings, and action.
colors:
  terracotta: "#e8712a"
  terracotta-deep: "#cf5811"
  app-bg: "#f3f4f6"
  app-card: "#ffffff"
  app-border: "#e7e8ec"
  ink: "#16161a"
  ink-muted: "#80808c"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', 'Geist', system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Plus Jakarta Sans', 'Geist', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Plus Jakarta Sans', 'Geist', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'Geist', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Geist', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "1.75rem"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
shadows:
  diffused: "0 20px 50px -20px rgba(20,20,30,0.08)"
  diffused-lg: "0 30px 70px -25px rgba(20,20,30,0.12)"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "6px 6px 6px 24px"
  button-primary-hover:
    backgroundColor: "{colors.terracotta-deep}"
  card-flat:
    backgroundColor: "{colors.app-card}"
    rounded: "{rounded.lg}"
    shadow: "{shadows.diffused}"
  card-full-shell:
    backgroundColor: "rgba(0,0,0,0.03)"
    rounded: "{rounded.xl}"
    shadow: "{shadows.diffused}"
  chip-active:
    backgroundColor: "{colors.terracotta}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
  chip-inactive:
    backgroundColor: "{colors.app-card}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
---

# Design System: Пазарувай умно

## 1. Overview

**Creative North Star: "Soft Structuralism"**

Пазарувай умно ("Shop smart") is a personal grocery-budgeting companion: set a budget, track active promotions across seven Bulgarian retail chains, build a shopping list, and watch what you spent and saved settle into place. The system reads like a piece of quiet, well-made hardware — bold geometric numbers floating on cool silver-grey surfaces, every major card framed by a machined double-bezel, ambient diffused shadows instead of hard lines, and exactly one warm terracotta accent reserved for the things that matter: progress, savings, deals, and calls to action. This is an app opened many times a day for a quick glance, so every surface stays calm, structured, and instantly legible — nothing competes with the numbers.

It explicitly rejects the gray, joyless density of spreadsheet-style budgeting tools and the templated SaaS-dashboard look (hero-metric clichés, identical flat cards, gradient text, decorative glassmorphism, system-default Inter/Lucide). Nothing here should feel borrowed from an English-first finance template — the type, the numbers, the store names and the currency are native to the Bulgarian grocery market, and the design should feel made for it.

**Key Characteristics:**
- One warm terracotta accent carries meaning (money, progress, savings, action); everything else is cool silver-grey-on-white neutrals.
- Numbers are the hero: large, extrabold Plus Jakarta Sans figures with `tabular-nums` for budget, spend and savings, never competing with decoration.
- Every major surface sits inside a **Double-Bezel** frame — a soft outer shell holding an inner core — giving the interface a machined, physical quality without hard borders.
- Sections breathe into view with a scroll-triggered `reveal-in` (blur + translate fade), and primary CTAs use a "button-in-button" magnetic trailing icon.
- Every surface, label and store name is written for a Bulgarian grocery shopper, not translated from a generic template.

## 2. Colors

The palette pairs a single warm terracotta against cool silver-grey-and-white neutrals — confident contrast without ever feeling loud or AI-purple.

### Primary
- **Terracotta** (`#e8712a`, `--color-accent`): The one accent color in the system. Used for primary actions (buttons, the active nav indicator, the "add to list" control), for marking progress (budget ring, spend bar), and for celebrating savings (badges, highlighted totals, the promo-match toast). Its rarity is what makes it readable as "this matters."
- **Terracotta Deep** (`#cf5811`, `--color-accent-dark`): The pressed/hover partner to Terracotta — and the second stop in gradient hero cards (budget hero, shopping-list summary, auth submit buttons). Never used standalone; always in relation to Terracotta.

### Neutral
- **App BG** (`#f3f4f6`, `--color-app-bg`): The app's resting background — a cool silver-grey, the page the cards float on.
- **App Card** (`#ffffff`, `--color-app-card`): Card and surface fill, pure white so cards read as distinct planes against the silver-grey page.
- **App Border** (`#e7e8ec`, `--color-app-border`): Hairlines, progress-rail tracks, dividers between list rows inside an expanded card. Never used as a colored accent stripe.
- **App Text** (`#16161a`, `--color-app-text`): Primary text — near-black, carrying the bulk of the reading weight (titles, totals, list items).
- **App Text Secondary** (`#80808c`, `--color-app-text-sec`): Secondary text — captions, helper copy, inactive nav labels, timestamps. Must still clear 4.5:1 against App BG and App Card; never lighten further "for elegance."

### Named Rules
**The One Accent Rule.** Terracotta appears with intent — action, progress, or a win — never as decoration. If a screen has more than a small handful of terracotta touches, something is being marked that doesn't deserve marking.

**The Cool Neutral Rule.** Every gray in the system leans cool silver, never warm. Depth comes from the App BG → App Card step plus diffused shadows, not from borders or gray fills.

## 3. Typography

**Display Font:** `'Plus Jakarta Sans', 'Geist', system-ui, sans-serif` (`--font-display`) — bold geometric Grotesk used for page titles, section headings, card titles, and every large numeric figure (budget amounts, totals, percentages).

**Body Font:** `'Geist', system-ui, 'Segoe UI', Roboto, sans-serif` (`--font-sans`) — used for body copy, form inputs, list-item names, and helper text. Both fonts are loaded via Google Fonts in `index.html`.

**Numerics:** All monetary and quantity figures use `tabular-nums` so digits don't shift width as values change — critical for a budget app where numbers update live.

### Hierarchy
- **Display** (`font-display`, extrabold/800, 24–28px, tight `-0.02em` tracking, 1.1 line-height): The hero figure on each screen — "Оставащ бюджет", the donut's center percentage, the shopping-list total, history's total spent/saved.
- **Headline** (`font-display`, bold/700, 22px, `-0.01em` tracking): Page titles ("Бюджет", "История", "Промоции", "Списък").
- **Title** (`font-display`, bold/700, 15px): Card and section headings ("Задай бюджет", "По месеци", "Горещи промоции", group headers).
- **Body** (`font-sans`, regular/400, 14px, 1.5 line-height): List items, descriptions, form labels, button text. Caps around 65–75ch where it wraps onto multiple lines.
- **Label** (`font-sans`, semibold/600, 12px): Captions, secondary stats, badges, nav labels, timestamps, store/category tags. Sentence case by default; uppercase reserved for short group headers like "ПОСЛЕДНИ ПАЗАРУВАНИЯ" (≤4 words, used sparingly).

### Named Rules
**The One Hero Number Rule.** Each screen gets exactly one Display-scale figure (or, on bento layouts like History, one headline pairing of two related figures) — the thing the user opened the app to check. Everything else steps down at least one full hierarchy level so that number reads instantly.

**The Display-for-Numbers Rule.** Any time a Euro amount, percentage, or count is the focal point of a card, render it in `font-display font-extrabold tabular-nums` — never in body weight, even at large sizes.

## 4. Elevation & The Double-Bezel

The system replaces hard borders and flat drop-shadows with **diffused ambient shadows** and a **Double-Bezel (Doppelrand)** card architecture — every major surface looks like a piece of machined hardware: a glass plate sitting in a soft tray.

### Shadow Vocabulary
- **`--shadow-diffused`** (`0 20px 50px -20px rgba(20,20,30,0.08)`): Resting elevation for standard cards, chips, and rows — `Bezel variant="flat"`.
- **`--shadow-diffused-lg`** (`0 30px 70px -25px rgba(20,20,30,0.12)`): Hero surfaces and floating elements — `Bezel variant="full"` outer shells, the floating bottom nav, toasts, notification popovers.
- **Tinted shadows:** The auth logo tile and submit buttons use a terracotta-tinted shadow (`shadow-[0_8px_24px_rgba(232,113,42,0.3)]`) — shadows that carry the accent hue rather than generic black, reserved for accent-colored surfaces.

### The `Bezel` Component (`src/components/Bezel.tsx`)
- **`variant="full"`** (default) — for hero/showpiece surfaces (budget hero card, auth card, budget-ring card, summary strips, the dashboard's empty/loading states). Structure: an **outer shell** (`p-1.5 rounded-[1.75rem] bg-black/[0.03] ring-1 ring-black/5 shadow-diffused`) wrapping an **inner core** (`rounded-[calc(1.75rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]`, with the caller supplying the background — `bg-app-card` for white cards, `bg-gradient-to-br from-accent to-accent-dark text-white` for hero gradients). The inset highlight reads correctly on both surfaces.
- **`variant="flat"`** — for repeating rows (promo cards, shopping-list items, history rows, stat tiles). A single layer: `rounded-2xl shadow-diffused`, with the caller supplying the background (`bg-app-card`).

### Named Rules
**The Earned Bezel Rule.** `variant="full"` is for the one or two showpiece surfaces per screen. Repeating lists (10-20 promo rows, history entries) always use `variant="flat"` — double-nesting every row would be visually heavy and tank scroll performance.

**The Single Light Source Rule.** All shadows fall softly downward with no directional bias — diffused, not directional drop-shadows. Never mix a hard black `box-shadow` with the diffused vocabulary on the same screen.

## 5. Components

### Buttons
- **Shape:** Full pill (`rounded-full`) for primary actions and chips; `rounded-xl`/`rounded-2xl` for form inputs and inline icon buttons.
- **Primary:** Terracotta fill (`#e8712a`), white text, semibold. Presses to `scale(0.97)` over 60ms (the `.pressable` class) — every interactive surface in the system gets this.
- **Button-in-Button (Magnetic CTA):** Primary CTAs with a trailing arrow (Auth submit, "Приключи пазаруването", promo add-to-list) nest the icon inside its own circular wrapper (`<span className="magnetic-icon w-8/9 h-8/9 rounded-full bg-white/15 flex items-center justify-center">`), with `.magnetic` on the parent button. On hover (gated by `(hover: hover) and (pointer: fine)`), the inner icon nudges diagonally and scales up slightly; on press it scales down — internal kinetic tension without moving the whole button.
- **Hover / Focus:** Background steps to Terracotta Deep (`#cf5811`) on hover with `transition-colors`; focus rings use `ring-2 ring-accent/40` on form controls — no bordered focus state.
- **Secondary / Ghost:** Text-only variants in App Text Secondary, used for dismissive or secondary actions ("Изход", mode-switch links, "Забравена парола?"); same press feedback applies.

### Chips / Segmented Controls
- **Style:** Full pill (`rounded-full`), no borders. Active state: Terracotta fill with white text (store filter tabs, period toggle, preset amounts) or a soft `accent/10` tint with terracotta text (category chips). Inactive: `bg-app-card` with `shadow-diffused` (chips that sit directly on App BG) or `bg-app-bg`/transparent (chips inside a card) with App Text Secondary.
- **State:** A horizontally-scrolling row (store tabs, category chips) — the active chip is the only colored element in the row, making the current filter unambiguous at a glance.

### Cards / Containers
- See **Section 4 — Elevation & The Double-Bezel** for the `Bezel` component and shadow vocabulary. All cards use `rounded-2xl` (flat) or `rounded-[1.75rem]` (full-shell outer) — no hairline borders anywhere; separation comes from the diffused shadow and the App BG → App Card contrast alone.
- **Internal dividers:** When a card expands to show a list (history's purchase-item breakdown), internal rows are separated by `border-b border-app-border` — the one place a hairline border remains, because it's an internal divider within a single bezel, not a card edge.

### Inputs / Fields
- **Style:** No border. `rounded-xl`/`rounded-2xl`, `bg-app-bg` fill (when inside a white `Bezel`) or transparent, 14px App Text.
- **Focus:** `ring-2 ring-accent/40` — a soft halo, the only focus indicator.
- **Error / Disabled:** Errors use a red-tinted background-and-border pairing (`red-50` / `red-200` / `red-600` text) — the one place borders return, for functional alert states. Disabled controls drop to App Border background and App Text Secondary text with `cursor-not-allowed`.

### Navigation — Floating Island
- **Style:** A floating pill detached from the viewport edge: `sticky bottom-3 mx-4 rounded-full bg-app-card shadow-diffused-lg ring-1 ring-black/5`, containing five icon-and-label tabs.
- **Active indicator:** A sliding `accent/10` pill behind the active tab's icon, animated with `--ease-spring` (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for a slight overshoot — not a static top-bar marker.
- **Default / Active:** Inactive tabs render icon + 10px label in App Text Secondary; the active tab's icon and label switch to Terracotta with semibold weight. Badge counts (Terracotta pill on the list icon) for at-a-glance status.

### Signature Component: The Budget Ring
A custom SVG donut chart (62px radius, 10px stroke, rounded line caps) animates its `stroke-dashoffset` over 0.8s with the system's custom `--ease-in-out` curve, tracking percentage of budget spent. It switches from Terracotta to a clear red (`#EF4444`) past 90% — the single place in the system where a second color is allowed to appear, because it signals something the user genuinely needs to notice. Lives inside a `Bezel variant="full"` card.

### Iconography
Phosphor Icons (`@phosphor-icons/react`), wrapped by `src/lib/icons.tsx`'s `IconProps`/`makeIcon` API — ultra-light, precise lines, never thick-stroked default icon sets. The one exception is `categoryIcon()`/`storeColor()` (`src/lib/catalogVisuals.ts`), which map real promo categories and store names to emoji/colors — a deliberate, established part of the catalog UI and out of scope for the anti-emoji rule.

## 6. Layout

### Asymmetric Bento (Dashboard & History)
On stat-heavy screens, lead with one full-width `Bezel variant="full"` headline tile, followed by a row of smaller `Bezel variant="flat"` tiles:
- **Dashboard:** hero budget card (full), then a featured "Промоции" tile + a `grid-cols-3` row of Списък/История/Бюджет quick-action tiles.
- **History:** a gradient headline tile (total spent / total saved), then a `grid-cols-2` row of flat tiles (trip count, savings rate).

### Single-Column Lists (Promotions & Shopping List)
List-heavy pages stay single-column on mobile (the PWA's primary form factor) but use the same `Bezel`, type, and motion language as the bento pages — search bar and summary strips in `variant="full"`, repeating rows in `variant="flat"`.

### Mobile Collapse
All layouts are designed mobile-first inside a `max-w-xl` centered column. Asymmetric grids reset to `grid-cols-1` / stacked sections below the bento breakpoints — there is no desktop-specific layout to "collapse from."

## 7. Motion

### Scroll Reveal (`src/components/Reveal.tsx`)
Sections (not individual rows) fade and blur into place on first viewport entry via `IntersectionObserver`: `translateY(16px) blur(6px) opacity-0` → resolved over 650ms with `--ease-out`. Applied at section granularity — hero card, quick-actions grid, stat tiles, grouped lists — to avoid observer overhead on long lists. Falls back to a static, fully-visible render under `prefers-reduced-motion`.

### Named Rules
- **`.pressable`** (`scale(0.97)` on `:active`, 120ms `var(--ease-out)`): every tappable surface, opened many times a day, must always feel instantly responsive.
- **`.magnetic`/`.magnetic-icon`**: button-in-button trailing-icon CTAs (see Components → Buttons).
- **`--ease-spring`** (`cubic-bezier(0.34, 1.56, 0.64, 1)`): the floating nav's sliding active-tab indicator — the only place a slight overshoot is used.
- All other transitions (color, background, shadow) use `--ease-out`/`--ease-in-out` and animate only `transform`/`opacity`/`color`/`stroke-dashoffset` — never layout properties.
- Every animation (`.shake`, `.spinner`, `.budget-ring-arc`, `.notif-panel`, `.reveal`/`.reveal-visible`, `.magnetic-icon`) has a `prefers-reduced-motion` fallback in `src/index.css`.

## 8. Do's and Don'ts

### Do:
- **Do** keep Terracotta (`#e8712a`) to the handful of elements that represent action, progress, or a win on any given screen — the One Accent Rule.
- **Do** wrap every showpiece surface in `Bezel variant="full"` and every repeating row in `Bezel variant="flat"` — the Earned Bezel Rule.
- **Do** render every focal Euro amount, percentage, or count in `font-display font-extrabold tabular-nums`.
- **Do** apply `.pressable` (`scale(0.97)` on `:active`, 120ms `var(--ease-out)`) to every tappable surface; this is opened many times a day and must always feel instantly responsive.
- **Do** use Phosphor icons via `src/lib/icons.tsx`; the only allowed emoji are `categoryIcon()`/`storeColor()` from `catalogVisuals.ts`.
- **Do** write every label, button, and empty-state in Bulgarian with EUR formatting via `formatEUR()` — this is a Bulgarian-market product, not a translated template.

### Don't:
- **Don't** add hairline borders to card edges — separation comes from `shadow-diffused`/`shadow-diffused-lg` and the App BG → App Card contrast. The only surviving borders are internal list dividers (`border-app-border`) and functional red error states.
- **Don't** build the gray, joyless spreadsheet look — no flat gray fills, no muted-on-muted text. Body and secondary text must clear 4.5:1 against App BG and App Card.
- **Don't** reach for hero-metric clichés, identical flat card grids, or gradient text — the templated-SaaS-dashboard look this system explicitly rejects.
- **Don't** use `border-left`/`border-right` colored stripes as accents on cards or list rows. Mark state with fill, the chip pattern, or the floating nav indicator instead.
- **Don't** introduce a second saturated color outside the budget ring's >90% red warning — that is the one deliberate exception, not a precedent.
- **Don't** animate beyond `transform`/`opacity`/`stroke-dashoffset`/`filter: blur` (and color, for state changes); always pair motion with a `prefers-reduced-motion` fallback.
