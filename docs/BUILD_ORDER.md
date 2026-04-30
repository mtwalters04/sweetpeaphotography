# Build Order

Phased plan. Each phase ends in something **shippable and useful** — not a half-built next phase.

The rule: **don't start phase N+1 until phase N is in production and you've used it.** AI will want to build everything at once. Resist.

---

## Phase 0 — Foundations (1–2 sessions)

Goal: a deployable empty Next.js app on Vercel with all services wired up.

- Next.js 14+ App Router, TypeScript strict, ESLint, Prettier.
- Tailwind with the design tokens from `DESIGN_SYSTEM.md` baked into config.
- Supabase project (dev + prod), `.env.local` template, types generated.
- R2 bucket (dev + prod), `@aws-sdk/client-s3` configured.
- Resend account, sender domain DNS in place.
- Stripe test keys.
- Vercel project, preview deploys working.
- Root layout with palette + type loaded, footer skeleton.
- A single `/` route showing one hero image and a placeholder headline.

**Done when:** the home route renders on a Vercel preview URL with the brand fonts and palette correctly applied.

---

## Phase 1 — Marketing front (the funnel)

Goal: a public site that makes someone want to book.

- Home: hero, intro, 3-row portfolio tease, 1 testimonial, "starting at" pricing tease, CTA to calendar.
- `/portfolio` index + `/portfolio/[slug]` detail.
- `/about` — the photographers, restrained.
- `/services` index + `/services/[slug]` per session type (reads from DB once Phase 2 lands; static for now).
- `/contact` (custom request entry point — form is stubbed until Phase 4).
- Footer with LocalBusiness schema.
- `robots.txt` and stub sitemap.

**Done when:** you'd send the URL to a friend without flinching.

---

## Phase 2 — Auth & accounts

Goal: customers can sign up and have a private area.

- Supabase Auth: email+password and magic link.
- `profiles` table with RLS.
- `/login`, `/signup`, `/account` shell.
- Account page shows: profile fields, credit balance (always 0 for now), empty bookings list, empty requests list.
- Middleware protecting `/account/*` and `/admin/*`.
- Admin role exists; super_admin can reach `/admin` but it only shows a placeholder.

**Done when:** you can sign up, sign in across devices, edit your profile.

---

## Phase 3 — Booking the published slot

Goal: the calendar-driven booking path works end to end with real money (Stripe test).

- `session_types`, `photographers`, `available_slots`, `bookings` tables.
- Admin: minimal UI to create session types, create photographers, publish slots.
- Public `/book` calendar: month view, available slots highlighted, click → detail.
- Slot detail → "Book — pay 30% deposit" → Stripe Checkout.
- Stripe webhook flips slot to `booked` and creates `bookings` row with `pipeline_stage = booked`.
- Email: `booking_confirmed` to customer, `admin_new_booking` to studio.
- Account page: shows the booking with pipeline stage.
- Hold mechanism: slot enters `held` for 15 minutes during checkout, releases on timeout.

**Done when:** a real test card books a real slot, both emails fire, customer sees it, admin sees it.

---

## Phase 4 — Custom requests

Goal: the second booking path.

- `custom_requests` table.
- Public form on `/contact` (or `/request`): date, optional session type, photographer pref, message, image uploads to R2.
- Admin inbox at `/admin/requests`: triage, quote, decline, withdraw.
- Quote action: emails customer with price + accept link.
- Accept link: customer accepts → system creates a private slot → Stripe Checkout → confirmed → request marks `converted`.
- All five status emails wired up.

**Done when:** a request can be submitted, quoted, accepted, paid, and shows up alongside calendar bookings.

---

## Phase 5 — Admin pipeline & gallery delivery (v1)

Goal: the studio can run the actual workflow.

- Admin dashboard "Today" screen.
- Bookings list with stage filtering.
- Booking detail with: customer info, payment status, notes, email log, stage controls.
- Pipeline stage transitions: shoot_scheduled → shoot_complete → editing → delivered → archived.
- T-7 reminder email cron.
- Gallery delivery: upload to R2 (admin form, multipart to presigned URLs), generate `delivery.zip`, email link, customer download from account page with signed URL.
- Cancellation flows (customer-initiated, admin-initiated) with credit ledger entries.
- Credits: `credit_ledger` table, balance computation, manual issue form, applied to checkout.

**Done when:** you can run an entire job from "booked" to "gallery delivered" without leaving the admin.

---

## Phase 6 — CRM, testimonials, polish

Goal: the studio runs day-to-day on this site.

- Customers screen: list, search, filter, drawer with history.
- Tags, lifecycle stage, last-contact age.
- Testimonials admin + public surfacing.
- Performance pass against the budgets in SEO_BLOG.md.
- Accessibility pass (axe, manual keyboard test).

**Done when:** you stop using whatever you used before this site.

---

## Phase 7 — Journal (blog)

Goal: SEO engine.

- `blog_posts` table + RLS.
- Admin editor (Tiptap or similar) with all required SEO fields.
- Public `/journal` index and `[slug]` pages.
- OG image generation at the edge, cached to R2.
- JSON-LD Article schema on each post.
- Sitemap and RSS.
- Three cornerstone posts seeded.

**Done when:** Google Search Console shows the site indexed and at least one post ranking.

---

## Phase 8+ — Maybe

Only if earned by usage:

- Rich gallery viewer (favoriting, downloads tracking).
- Print store integration.
- Realtime admin updates.
- Analytics dashboard.
- Mobile app (almost certainly never).

---

## Anti-goals while building

- Don't refactor across phases until you've shipped two.
- Don't build admin UI before its corresponding customer-facing flow exists.
- Don't add a feature in a phase because "we'll need it later." Add it in the phase that needs it.
- Don't write tests for code that will be rewritten in the next phase. Do write tests for the credit ledger, the booking lifecycle state machine, and the Stripe webhook from day one — those have to be right.
