# Sweet Pea Photography — Project Brain

This file is loaded into every AI session. It is the **eagle-eye view**. Deeper details live in `docs/`. Read this first; consult specific docs when implementing.

The user's global `~/.claude/CLAUDE.md` (Karpathy-style: think before coding, simplicity, surgical changes, goal-driven execution) **always applies**. Nothing here overrides it. This file adds *project context*, not new rules of engagement.

---

## 1. What this is

**Sweet Pea Photography** is a two-photographer studio (the owner and his wife). The site is both **a portfolio** and **a sales funnel** — visitors should feel the work, then convert into booked sessions without friction.

**Primary services:** portraits & events (weddings, engagements, families, holidays, graduations, mini-sessions). Open to anything — turning nothing away by default.

**Market:** single local market for v1. Travel is possible but priced separately.

**Photographers:** two — owner + wife. They usually work together. Customers may optionally request one specifically.

---

## 2. The two ways to book (this is the core of the product)

This distinction must be obvious in code and UX:

1. **Book an available slot.** Admin pre-publishes dates with a session type, time, and price. Customer picks one, pays a 30% deposit, done.
2. **Custom request.** Customer didn't see a slot/type/time that works. They submit a date + time + session type + notes. Admin reviews, quotes, and either approves (which converts it into a bookable slot for that customer with a deposit link) or declines.

**Custom requests can also extend an existing offering.** Example: a holiday mini-session is published at $X for 20 minutes; customer wants 60 minutes plus a wardrobe change. They submit a request referencing that session type, admin quotes a custom price.

→ See [docs/DATA_MODEL.md](docs/DATA_MODEL.md) for the schema and [docs/ADMIN_PIPELINE.md](docs/ADMIN_PIPELINE.md) for the workflow.

---

## 3. Money rules (no refunds, credits only)

- **30% deposit** to confirm any booking. Non-negotiable.
- **No cash refunds, ever.** All "refunds" become **account credits**.
- **Customer-initiated cancel ≥ 48h before shoot** → deposit becomes credit.
- **Customer-initiated cancel < 48h before shoot** → deposit forfeited.
- **Studio-initiated cancel** (weather, illness, equipment failure, anything on our side) → full deposit becomes credit, automatically.
- Credits are tied to the customer account, never expire by default, and apply to any future session/request.

If the AI is implementing payment or cancellation logic and these rules don't fit cleanly, **stop and ask** — do not invent a refund path.

---

## 4. Aesthetic — "quiet luxury, minimalist, moody"

The brand voice is **restrained and confident**. Nothing shouts. Emotion lives in the photos, not in the chrome around them.

Concrete defaults (full spec in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)):
- Deep neutral palette (warm blacks, bone, taupe). One subtle accent. **No bright primaries. No gradients. No drop shadows on cards.**
- Generous whitespace. Type at rest, not crowded.
- One serif display face + one neutral sans for UI. Avoid trendy variable-font stunts.
- Motion: slow, eased, sparing. No bounce, no parallax-by-default.
- Photos do the talking. UI gets out of the way.

If a design choice would feel at home on a generic SaaS landing page, **it's wrong for this site.**

---

## 5. Account requirement

Booking, requesting, viewing galleries, using credits — **all gated behind an account**. This is intentional:
- Customers get session tracking, gallery access, credit balance, history.
- The studio gets CRM data, communication channels, retention.
- Cancellations and credits require an account anchor.

Email/password + magic link via Supabase Auth. No social login in v1 unless we change our minds.

---

## 6. Stack (decided — don't re-litigate without asking)

- **Next.js (App Router)** on **Vercel** — frontend + API routes
- **Supabase** — Postgres, Auth, RLS, realtime where useful
- **Cloudflare R2** — image and gallery file storage (zero egress)
- **Resend** — transactional email
- **Stripe** — deposits and any future payments
- **MDX or Supabase-backed blog** (decide in [docs/SEO_BLOG.md](docs/SEO_BLOG.md))

Why each, and where the lines are drawn: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 7. The admin dashboard is a workhorse, not a CMS

The admin side is the **operational nervous system** of the business. It is *not* a content editor with a few extra screens. It must handle:

- Publishing available session slots (dates, times, types, prices, photographer assignment)
- Reviewing and quoting custom requests
- Tracking every booking through a pipeline (inquiry → booked → shoot complete → editing → delivered → archived)
- Issuing credits, viewing customer history, sending updates
- Light CRM (notes, tags, lifecycle stage, last contact)
- Blog authoring with SEO controls

Power and clarity beat features. **If a screen would only get used once a month, it doesn't ship in v1.**

Full pipeline spec: [docs/ADMIN_PIPELINE.md](docs/ADMIN_PIPELINE.md).

---

## 8. Where to look

| Doc | When to read |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Touching infra, services, auth, payments, storage |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Touching the database, schema, RLS, state transitions |
| [docs/ADMIN_PIPELINE.md](docs/ADMIN_PIPELINE.md) | Touching admin UI or the booking lifecycle |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Any UI work — *especially* the public-facing site |
| [docs/SEO_BLOG.md](docs/SEO_BLOG.md) | Blog, sitemap, structured data, OG images |
| [docs/BUILD_ORDER.md](docs/BUILD_ORDER.md) | Deciding what to work on next |

---

## 9. Things AI gets wrong on this kind of project — don't

- **Do not** add social login, public reviews, comment systems, or "trending" features unless asked.
- **Do not** build an in-app messenger; email via Resend is the channel.
- **Do not** model the calendar with separate "availability" and "booking" tables that drift out of sync — see DATA_MODEL.
- **Do not** add a refund-to-card path. Ever. Credits only.
- **Do not** invent session types not on the published list — admin defines them.
- **Do not** style the public site like a SaaS dashboard. Re-read §4.
- **Do not** assume one photographer. Always model `photographer_id` on bookings.

---

## 10. Naming

- Brand: **Sweet Pea Photography**
- Two photographers; refer to them as `photographer_a` / `photographer_b` in seed data until real names are wired in.
- Project directory: `sweetpeaphotography` (no hyphen, lowercase).
