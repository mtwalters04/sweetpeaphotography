# Architecture

System map. Where each service starts and stops.

```
                    ┌───────────────────────┐
                    │   Visitor / Customer  │
                    └──────────┬────────────┘
                               │
                               ▼
                    ┌───────────────────────┐
                    │  Next.js on Vercel    │  ◄── public site, account area, admin
                    │  (App Router, RSC)    │
                    └────┬─────┬─────┬──────┘
                         │     │     │
                ┌────────┘     │     └─────────────┐
                ▼              ▼                   ▼
         ┌───────────┐  ┌─────────────┐    ┌──────────────┐
         │ Supabase  │  │   Stripe    │    │   Resend     │
         │ (PG+Auth) │  │  (deposits) │    │ (txn email)  │
         └─────┬─────┘  └──────┬──────┘    └──────────────┘
               │               │
               │               ▼
               │        ┌────────────┐
               │        │  Webhook   │── booking.confirmed → mark booking paid
               │        └────────────┘
               ▼
         ┌───────────┐
         │ Cloudflare│
         │    R2     │ ◄── photo originals, gallery zips, OG images
         └───────────┘
```

---

## Service responsibilities

### Vercel (Next.js)
- All UI and API routes.
- Server Components by default. Client Components only when interactivity demands it (calendar, forms with live validation, admin tables).
- Route groups: `(public)`, `(account)`, `(admin)`.
- Edge runtime for OG image generation; Node runtime for Stripe/webhook routes.
- ISR for blog and gallery preview pages; SSR for booking calendar (must reflect live availability).

### Supabase
- Postgres for **all** relational data.
- Auth — email/password + magic link. No social v1.
- Row-Level Security on **every** table that holds user data. Never query bypass-RLS from the client.
- Storage **not used** for photos (R2 is canonical). Supabase storage may hold small admin-only assets if convenient.
- Realtime: optional for admin dashboard live updates; not required for v1.

### Cloudflare R2
- Canonical store for: customer-uploaded reference images, gallery originals, gallery delivery zips, OG image cache.
- Access via **presigned URLs only**. Never expose bucket directly.
- Folder layout (proposed):
  ```
  /galleries/{booking_id}/originals/...
  /galleries/{booking_id}/web/...
  /galleries/{booking_id}/delivery.zip
  /og/{slug}.png
  /uploads/{user_id}/{request_id}/...
  ```

### Stripe
- Deposits only in v1. PaymentIntents with `capture_method: automatic`.
- Webhook endpoint at `/api/stripe/webhook` (Node runtime). Verifies signature, updates `bookings.status` to `confirmed`.
- **Never** trust client-side payment success — only the webhook flips status.
- No saved cards in v1. No subscriptions.

### Resend
- All transactional email: booking confirmed, request received, request quoted, shoot reminders, gallery delivered, credit issued.
- Templates as React Email components, version-controlled.
- One sender domain (e.g. `mail.sweetpeaphotography.com`), SPF/DKIM/DMARC configured.

---

## On R2 vs. Pixieset/Pic-Time (gallery delivery)

**Decision: R2 + simple delivery in v1, defer rich gallery UX to a later phase.**

Tradeoff:
- **R2 wins on cost** (no egress) and **on control** (everything in one stack, one auth model).
- **Pixieset/Pic-Time win on UX**: favoriting, download tracking, print store, watermarking, mobile-optimized galleries — all out of the box.

For v1, the customer experience is:
1. Admin uploads finished photos to R2 under `/galleries/{booking_id}/`.
2. System generates a `delivery.zip`.
3. Customer gets an email with a link; the account page shows a "Download Gallery" button (signed URL, expires after N days, regenerable).
4. Optional web previews via the `/web/` folder for in-page browsing.

**Phase 6+** can layer on a real gallery viewer (favoriting, print order) if it earns its keep. Don't build it speculatively.

---

## Auth model

- Three roles: `customer` (default), `photographer` (admin), `super_admin` (you).
- Stored on a `profiles` table joined 1:1 with `auth.users`.
- RLS policies key off `auth.uid()` and the role column.
- Admin routes (`/admin/*`) are protected by middleware that checks role server-side. Never rely on client checks.

---

## Environments

- **local** — `.env.local`, Supabase project for dev, Stripe test mode, R2 dev bucket, Resend in test mode.
- **preview** — every PR gets a Vercel preview pointing at the dev Supabase. Never preview against prod data.
- **production** — separate Supabase project, Stripe live, R2 prod bucket, Resend prod domain.

Secrets live in Vercel env vars. Never commit `.env*`. The repo `.gitignore` must include them from day one.

---

## What we are NOT building (yet)

- In-app messaging (email is the channel).
- Public comments or reviews (testimonials are admin-curated).
- Mobile app.
- Multi-tenant / multi-studio support.
- Print store integration.
- AI culling/editing tools.

Each of these can be revisited. Today they are **explicitly out of scope** so AI doesn't drift toward them.
