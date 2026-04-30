# Design System — "Quiet Luxury"

The hardest doc to get right and the easiest one for AI to ignore. **Read this every time you touch UI.**

The brief: **luxurious, minimalist, moody. Quiet but impactful. Emotion at the edges, not at the center.**

This is not "dark mode SaaS." It is not "wedding-photographer-template-theme-3." It is a confident, unhurried space that lets photographs breathe.

---

## North star

> If a visitor lands on the homepage with the sound off and the page only half-loaded, the image still has to feel expensive.

---

## Palette

Defaults — implement as CSS variables, named semantically.

| Token | Value (proposed) | Use |
|---|---|---|
| `--ink` | `#1a1716` | primary text, near-black with warmth |
| `--bone` | `#f4efe9` | primary background — warm off-white |
| `--mist` | `#e6dfd6` | secondary background, dividers |
| `--ash` | `#7a716a` | secondary text, metadata |
| `--accent` | `#8a6f5a` (warm taupe) | hover/active, single accent — **never** a bright color |
| `--shadow` | rgba(26,23,22,0.08) | only for modals/sheets, never cards |

Forbidden: pure `#000`, pure `#fff`, primary blue/red/green, gradients, neon.

A dark-mode counterpart exists but is opt-in via prefers-color-scheme; v1 ships light-mode only to keep focus.

---

## Type

- **Display serif** for headlines, hero, section titles. Suggested: *Cormorant Garamond*, *EB Garamond*, or *Fraunces* (low-contrast settings). Pick one and commit.
- **UI sans** for body, nav, forms, admin. Suggested: *Inter*, *Söhne*, or *General Sans*. Pick one.
- Track headlines slightly tight (-1% to -2%). Body at default tracking.
- **Type scale** (modular, ratio ~1.25):
  ```
  --t-12, --t-14, --t-16, --t-18, --t-22, --t-28, --t-36, --t-48, --t-64
  ```
- Body line-height generous: `1.6` minimum.
- **No all-caps for headlines.** Small-caps allowed for eyebrow labels.

---

## Layout & space

- 12-column grid, but used loosely. Asymmetry > rigid grids.
- Generous whitespace. **If it feels empty, it's probably right.**
- Section vertical rhythm: minimum `clamp(96px, 12vw, 192px)` between major sections.
- Max content width 1280px; text columns max ~640px.

---

## Imagery

The photos are the product. Treatment rules:

- Show full-bleed hero images at section breaks.
- Aspect ratios: respect the original — don't crop to a square grid by default. Let portraits be tall.
- **No filters or treatments** layered onto photos by code (no duotone, no overlays beyond a subtle gradient for legibility on hero text).
- Lazy-load below the fold; preload one hero image. Use `next/image` with sharp.
- Serve AVIF + WebP; R2 origin, Vercel image optimization.

---

## Motion

- **Default to no motion.** Animation must justify itself.
- Allowed: 200–400ms ease-out fades on enter, slow parallax on hero photos *only if subtle* (max 8px translate).
- Forbidden: bounce easings, hover scale on cards, rotating elements, scroll-jacking, GSAP timelines, anything that says "look at me."
- Respect `prefers-reduced-motion`.

---

## Components — public site

| Component | Notes |
|---|---|
| Nav | Thin, sticky, becomes solid on scroll. No mega-menu. Logo + 4 links + "Book". |
| Hero | Full-bleed photo, single line of serif overlay, single CTA. No carousel. |
| Portfolio grid | Masonry or asymmetric grid. Click → modal-less detail page. |
| Testimonial | Pull-quote serif, attribution in small caps. No star ratings. |
| Pricing tease | "Starting at $X" only. Real prices live on the calendar. |
| Booking calendar | Month view, available slots highlighted with type+price. Click → detail → checkout. |
| Custom request form | Multi-step but feels like one form. Date, type (optional), message, references. |
| Footer | Generous, type-driven. No newsletter popup. |

---

## Components — admin

The admin dashboard does **not** need to feel luxurious. It needs to feel **fast and clear**. Use the same color tokens but increase information density.

- Tables over cards.
- Keyboard-navigable everywhere.
- Use the same type families but step the scale down one notch.
- No animations beyond focus rings and 100ms hovers.

---

## Copy voice

- Lowercase eyebrow labels in small caps.
- Headlines: short, declarative, never clever.
  - ✅ "Heirlooms, in modern light."
  - ❌ "📸 Capturing your special moments! ✨"
- Body: warm, plainspoken, second person. No exclamation points.
- CTAs: verbs.
  - ✅ "See available dates" / "Request a custom date"
  - ❌ "Book now!" / "Get started"

---

## What to do when AI generates UI for this site

Quick self-check before claiming done:

- [ ] Did I add a gradient or drop shadow that wasn't asked for? Remove it.
- [ ] Is anything bouncing or scaling on hover? Remove it.
- [ ] Are headlines uppercase or screaming? Fix.
- [ ] Are there more than 2 type families? Cut to 2.
- [ ] Does any color outside the palette appear? Replace with token.
- [ ] Does the image have any treatment beyond subtle scrim for text? Remove.
- [ ] Would this look at home on Linear, Stripe, or Notion's marketing site? **That's a failure mode** — those are SaaS aesthetics, not editorial luxury.

The benchmark is closer to: **Aman Resorts, Toteme, The Row, Apartamento magazine.**
