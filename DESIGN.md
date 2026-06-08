---
name: Пазарувай умно
description: A calm, trustworthy grocery-budgeting PWA where a single warm terracotta accent marks what matters — spend, savings, deals — against quiet paper-white neutrals.
colors:
  terracotta: "#e8712a"
  terracotta-deep: "#cf5811"
  paper: "#f5f5f7"
  paper-card: "#ffffff"
  hairline: "#e8e8ee"
  ink: "#1a1a2e"
  ink-muted: "#7a7a8e"
typography:
  display:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "38px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.terracotta-deep}"
  card:
    backgroundColor: "{colors.paper-card}"
    rounded: "{rounded.lg}"
  chip-active:
    backgroundColor: "{colors.terracotta}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
  chip-inactive:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
---

# Design System: Пазарувай умно

## 1. Overview

**Creative North Star: "The Warm Receipt"**

Пазарувай умно ("Shop smart") is a personal grocery-budgeting companion: set a budget, track active promotions across seven Bulgarian retail chains, build a shopping list, and watch what you spent and saved settle into place. The system reads like a well-kept paper receipt redrawn for a screen — orderly rows, clear totals, generous quiet space, and exactly one warm color reserved for the things that matter: progress, savings, deals, and calls to action. Everything else stays calm and out of the way, because this is an app opened many times a day for a quick glance, not a destination to linger in.

It explicitly rejects the gray, joyless density of spreadsheet-style budgeting tools and the templated SaaS-dashboard look (hero-metric clichés, identical flat cards, gradient text, decorative glassmorphism). Nothing here should feel borrowed from an English-first finance template — the type, the numbers, the store names and the currency are native to the Bulgarian grocery market, and the design should feel made for it.

**Key Characteristics:**
- One warm terracotta accent carries meaning (money, progress, savings, action); everything else is quiet ink-on-paper neutrals.
- Numbers are the hero: large, extrabold, tabular-feeling figures for budget, spend and savings, never competing with decoration.
- Calm by default, lifted at the moments that deserve attention — the budget hero card, completion toasts, freshly-added items.
- Every surface, label and store name is written for a Bulgarian grocery shopper, not translated from a generic template.

## 2. Colors

The palette pairs a single warm, earthy terracotta against cool paper-white neutrals — confident contrast without ever feeling loud.

### Primary
- **Terracotta** (`#e8712a`): The one accent color in the system. Used for primary actions (buttons, the active nav tab, the "add to list" control), for marking progress (budget ring, spend bar), and for celebrating savings (badges, highlighted totals, the promo-match toast). Its rarity is what makes it readable as "this matters."
- **Terracotta Deep** (`#cf5811`): The pressed/hover partner to Terracotta — and the second stop in the budget hero card's gradient. Never used standalone; always in relation to Terracotta.

### Neutral
- **Paper** (`#f5f5f7`): The app's resting background — a barely-cool off-white, the page the cards sit on.
- **Paper Card** (`#ffffff`): Card and surface fill, a half-step brighter than Paper so cards read as distinct planes without needing a shadow to announce themselves.
- **Hairline** (`#e8e8ee`): Borders, dividers, track backgrounds (progress rails, the donut's base ring). Always 1px, never a colored stripe.
- **Ink** (`#1a1a2e`): Primary text — a deep navy-black, warmer and softer than pure black, carrying the bulk of the reading weight (titles, totals, list items).
- **Ink Muted** (`#7a7a8e`): Secondary text — captions, helper copy, inactive nav labels, timestamps. Must still clear 4.5:1 against Paper and Paper Card; never lighten further "for elegance."

### Named Rules
**The One Accent Rule.** Terracotta appears with intent — action, progress, or a win — never as decoration. If a screen has more than a small handful of terracotta touches, something is being marked that doesn't deserve marking.

**The Tonal Surface Rule.** Depth between Paper and Paper Card comes from a half-step lightness shift plus a hairline border, not from gray fills or shadows at rest. Shadows are reserved for elements that should visually float (see Elevation).

## 3. Typography

**Display & Body Font:** `system-ui, 'Segoe UI', Roboto, sans-serif` — a single native system stack used at every weight, kept deliberately invisible so the numbers and Bulgarian copy carry the voice instead of the typeface.

**Character:** One well-tuned sans in heavy weight contrast: extrabold for the figures that matter (budget remaining, spend, savings, the donut percentage), bold for titles, regular for everything that supports them. The pairing should feel like a confident receipt printout — legible, weighty where it counts, quiet everywhere else.

### Hierarchy
- **Display** (extrabold/800, 38px, tight `-0.02em` tracking, 1.1 line-height): Reserved for the single most important number on a screen — "Оставащ бюджет" in the hero card, the donut's center percentage. Appears at most once per screen.
- **Headline** (bold/700, 22px, `-0.01em` tracking): Page titles ("Бюджет", "История", "Промоции"). Sets the screen's subject and nothing else competes with it at that size.
- **Title** (bold/700, 15px): Card and section headings ("Задай бюджет", "По месеци", group headers).
- **Body** (regular/400, 14px, 1.5 line-height): List items, descriptions, form labels, button text. Caps around 65–75ch where it wraps onto multiple lines (it rarely needs to — this is a numbers-and-labels app, not a prose one).
- **Label** (semibold/600, 12px): Captions, secondary stats, badges, nav labels, timestamps, store/category tags. Sentence case by default; uppercase reserved for short group headers like "ПОСЛЕДНИ ПАЗАРУВАНИЯ" (≤4 words, used sparingly).

### Named Rules
**The One Hero Number Rule.** Each screen gets exactly one Display-scale figure — the thing the user opened the app to check. Everything else steps down at least one full hierarchy level so that number reads instantly.

## 4. Elevation

The system uses a hybrid: most surfaces stay flat at rest (Paper Card + hairline border is enough to read as "a card"), but the elements that represent the user's most important information — the budget hero, completed actions, anything that should feel like it's surfacing toward the user — lift with soft, warm-toned ambient shadows. Depth is earned by importance, not applied uniformly; a screen where every card floats is a screen where nothing does.

### Shadow Vocabulary
- **Hero lift** (`box-shadow: 0 8px 32px rgba(0,0,0,0.15)`): The budget hero card and other primary "headline" surfaces — paired with the terracotta gradient fill, this is the system's strongest visual statement and should stay rare.
- **Card lift** (`box-shadow: 0 2px 12px rgba(26,26,46,0.06)`): A gentle ambient shadow for standard content cards (promo rows, list items, stat tiles) — just enough to separate the plane from Paper without competing with the hero.
- **Toast / floating lift** (`box-shadow: 0 12px 28px rgba(232,113,42,0.25)`): Tinted toward Terracotta for in-context confirmations (toasts, "added to list" feedback) — the shadow itself echoes the accent, reinforcing that this is a positive, accent-colored moment.

### Named Rules
**The Earned Lift Rule.** A shadow is a claim that something deserves the user's attention right now. Reserve it for the hero figure, confirmations, and momentary feedback — not for every card on the screen.

## 5. Components

### Buttons
- **Shape:** Rounded corners at 12px (`rounded-xl`) for standard buttons, full pill (`rounded-full`) for compact tag-style actions.
- **Primary:** Terracotta fill (`#e8712a`), white text, semibold 14px, `10px 16px` padding. Presses to `scale(0.97)` over 60ms (the `.pressable` class) — every interactive surface in the system gets this, it's how the interface confirms it heard the tap.
- **Hover / Focus:** Background steps to Terracotta Deep (`#cf5811`) on hover with a `transition-colors`; focus rings use `ring-2 ring-accent/40` on form controls. No animation beyond color and the press-scale — this is tapped dozens of times a day and must never feel like it's making the user wait.
- **Secondary / Ghost:** Text-only or bordered variants in Ink Muted, used for dismissive or secondary actions ("Изход", mode-switch links); same press feedback applies.

### Chips / Segmented Controls
- **Style:** Pill or 10–12px-radius rectangles. Active state: Terracotta fill (full strength for store filters, a soft `terracotta/9%` tint with `terracotta/25%` border for category chips) with white or Terracotta text. Inactive: Paper Card fill, Ink Muted text, hairline or transparent border.
- **State:** A horizontally-scrolling row (store tabs, category chips, period segmented control) — the active chip is the only colored element in the row, making the current filter unambiguous at a glance.

### Cards / Containers
- **Corner Style:** 16px (`rounded-2xl`) for standard content cards, 18–20px for hero-scale surfaces (budget ring card, gradient strip).
- **Background:** Paper Card (`#ffffff`) at rest; the budget hero and shopping-list summary use a `linear-gradient(135deg, terracotta, terracotta-deep)` fill with white text instead.
- **Shadow Strategy:** Standard cards take the new Card Lift shadow (replacing the bare hairline-only look); hero surfaces keep Hero Lift. See Elevation.
- **Border:** Hairline (`#e8e8ee`, 1px) on neutral cards; gradient hero cards drop the border entirely (the shadow alone separates them from Paper).
- **Internal Padding:** 16–24px (`p-4` to `p-6`), generous enough that numbers and labels never feel cramped against the edge.

### Inputs / Fields
- **Style:** Hairline border (1.5px on primary form fields, 1px on inline ones), 12px radius, transparent or Paper Card background, 14px Ink text.
- **Focus:** `ring-2 ring-accent/40` glow plus border-color shift to Terracotta — a soft halo, not a hard outline.
- **Error / Disabled:** Errors use a red-tinted background-and-border pairing (`red-50` / `red-200` / `red-600` text) consistent with the "tonal surface, not gray" philosophy; disabled controls drop to Hairline background and Ink Muted text with `cursor-not-allowed`.

### Navigation
- **Style:** A sticky bottom tab bar (Paper Card fill, hairline top border) with five icon-and-label tabs. The active tab's icon and 10px label switch to Terracotta with semibold weight, and a short 3px Terracotta bar floats above it — a small, confident "you are here" marker rather than a full pill background.
- **Default / Active:** Inactive tabs render in Ink Muted at regular weight; active tabs are the only colored element in the bar, mirroring the chip philosophy (one accent, used to mean something).
- **Mobile:** Designed mobile-first as the primary surface — the bar sits flush to the viewport bottom inside a centered `max-w-xl` column, with badge counts (Terracotta pill on the list icon) for at-a-glance status.

### Signature Component: The Budget Ring
A custom SVG donut chart (62px radius, 10px stroke, rounded line caps) animates its `stroke-dashoffset` over 0.8s with the system's custom `--ease-in-out` curve, tracking percentage of budget spent. It switches from Terracotta to a clear red (`#EF4444`) past 90% — the single place in the system where a second color is allowed to appear, because it signals something the user genuinely needs to notice.

## 6. Do's and Don'ts

### Do:
- **Do** keep Terracotta (`#e8712a`) to the handful of elements that represent action, progress, or a win on any given screen — the One Accent Rule.
- **Do** give the most important figure on each screen Display scale (38px/800) and let everything else step down — the One Hero Number Rule.
- **Do** apply `.pressable` (`scale(0.97)` on `:active`, 120ms `var(--ease-out)`) to every tappable surface; this is opened many times a day and must always feel instantly responsive.
- **Do** use the warm-tonal pairing (Paper `#f5f5f7` → Paper Card `#ffffff` → Hairline `#e8e8ee`) to build depth before reaching for shadows; reserve Hero Lift and Card Lift shadows for surfaces that should visually float.
- **Do** write every label, button, and empty-state in Bulgarian with EUR formatting via `formatEUR()` — this is a Bulgarian-market product, not a translated template.

### Don't:
- **Don't** build the gray, joyless spreadsheet look — no flat gray fills, no muted-on-muted text. Body and secondary text must clear 4.5:1 against Paper and Paper Card.
- **Don't** reach for hero-metric clichés, identical flat card grids, or gradient text — the templated-SaaS-dashboard look this system explicitly rejects.
- **Don't** use `border-left`/`border-right` colored stripes as accents on cards or list rows. Mark state with fill, the chip pattern, or the floating nav indicator instead.
- **Don't** introduce a second saturated color outside the budget ring's >90% red warning — that is the one deliberate exception, not a precedent.
- **Don't** animate beyond `transform`/`opacity`/`stroke-dashoffset` (and color, for state changes); this keeps frequent daily interactions fast and battery-friendly, and always pair motion with a `prefers-reduced-motion` fallback.
