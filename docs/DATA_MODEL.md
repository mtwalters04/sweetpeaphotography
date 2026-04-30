# Data Model

The schema before the schema. Names are suggestions; shapes and relationships are the contract.

---

## Entities

### `profiles`
1:1 with `auth.users`. Holds role and customer-facing fields.

| field | type | notes |
|---|---|---|
| id | uuid PK | = `auth.users.id` |
| role | enum | `customer` \| `photographer` \| `super_admin` |
| full_name | text | |
| phone | text | nullable |
| credit_balance_cents | int | default 0 — denormalized for fast reads, source of truth = `credit_ledger` |
| crm_stage | enum | `lead` \| `active` \| `repeat` \| `dormant` |
| crm_tags | text[] | |
| notes | text | admin-only, RLS-blocked from customer |
| created_at, updated_at | tz | |

### `photographers`
The two-person studio. Distinct from `profiles.role='photographer'` — these are the *bookable* humans.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| display_name | text | |
| profile_id | uuid FK | nullable — link to login if they have one |
| bio | text | |
| active | bool | default true |

### `session_types`
Catalog of what the studio offers. Admin-managed.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | `holiday-mini`, `wedding-full`, `engagement`, etc. |
| name | text | |
| description | text | |
| default_duration_min | int | |
| starting_price_cents | int | for "starting at" display |
| is_active | bool | |

### `available_slots`
Admin-published bookable slots. **The calendar reads from here.**

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| session_type_id | uuid FK | |
| photographer_id | uuid FK | nullable = "either/both" |
| starts_at | tz | |
| duration_min | int | |
| price_cents | int | published price for this slot |
| status | enum | `open` \| `held` \| `booked` \| `cancelled` |
| held_until | tz | nullable — short hold during checkout |
| notes_public | text | shown to customer |
| notes_admin | text | not shown |

A slot is **the unit of availability**. When a customer books it, status flips to `held` (with `held_until` ~15 min for payment), then `booked` on Stripe webhook.

### `bookings`
A confirmed customer ↔ slot relationship. One row per customer-confirmed booking.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK profiles | |
| slot_id | uuid FK available_slots | unique — one booking per slot |
| photographer_id | uuid FK | locked at booking time |
| session_type_id | uuid FK | denormalized for history |
| price_cents | int | locked at booking time |
| deposit_cents | int | typically 30% of price |
| stripe_payment_intent_id | text | |
| status | enum | see lifecycle below |
| pipeline_stage | enum | see [ADMIN_PIPELINE.md](ADMIN_PIPELINE.md) |
| shoot_started_at | tz | |
| gallery_delivered_at | tz | |
| gallery_r2_prefix | text | e.g. `/galleries/{booking_id}/` |
| created_at, updated_at | tz | |

**Booking status lifecycle:**
```
pending_payment → confirmed → completed → archived
                ↘ cancelled_with_credit
                ↘ cancelled_forfeit
                ↘ studio_cancelled  (auto-credits)
```

### `custom_requests`
The "I don't see what I want" path.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK profiles | |
| session_type_id | uuid FK | nullable — they may not pick one |
| requested_at | tz | preferred date/time |
| duration_min | int | nullable |
| photographer_pref | uuid FK photographers | nullable |
| message | text | the customer's pitch |
| reference_image_keys | text[] | R2 keys for any uploads |
| status | enum | see lifecycle below |
| quote_cents | int | nullable until quoted |
| quote_notes | text | admin → customer |
| converted_booking_id | uuid FK bookings | nullable, set when approved+booked |
| created_at, updated_at | tz | |

**Custom request lifecycle:**
```
submitted → quoted → accepted → converted_to_booking
         ↘ declined
         ↘ withdrawn (by customer)
         ↘ expired (no response)
```

When `accepted`, the system creates a private `available_slots` row for that customer and a Stripe deposit link.

### `credit_ledger`
Source of truth for `profiles.credit_balance_cents`. Append-only.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK | |
| delta_cents | int | + for issued, − for spent |
| reason | enum | `cancel_48h`, `studio_cancel`, `goodwill`, `applied_to_booking`, `manual_adjust` |
| related_booking_id | uuid FK | nullable |
| admin_id | uuid FK | who issued (null for auto) |
| memo | text | |
| created_at | tz | |

Recompute `credit_balance_cents` from the ledger on every write. Do not let the denormalized field drift.

### `testimonials`
Admin-curated. Not user-submitted in v1.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| customer_name | text | display name, may be first-name only |
| quote | text | |
| session_type_id | uuid FK | nullable |
| featured_image_key | text | R2 key |
| display_order | int | |
| is_published | bool | |

### `blog_posts`
See [SEO_BLOG.md](SEO_BLOG.md).

### `email_log`
Every Resend send recorded. Useful for debugging delivery and CRM.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| to_user_id | uuid FK | nullable for non-account sends |
| template | text | `booking_confirmed`, etc. |
| subject | text | |
| resend_id | text | |
| status | text | from Resend |
| sent_at | tz | |

---

## Why a separate `available_slots` table?

The naive design merges availability and bookings into one table with a nullable `customer_id`. **Don't.** Reasons:

1. Admin needs to publish slots in bulk (e.g. "12 holiday minis on Nov 30") without creating fake customer rows.
2. A slot can be cancelled by admin without touching a booking.
3. Custom-request approvals create a *private* slot for one customer — same shape as public slots, different visibility.
4. Reporting on utilization ("what % of published slots booked?") is trivial against a slots table.

The booking is the **relationship**, not the slot itself.

---

## RLS sketch

- `profiles`: customer can read/update own; admin can read/update all.
- `available_slots`: anyone can read where `status='open'` AND not private; admin full access.
- `bookings`: customer can read own; admin all.
- `custom_requests`: customer can read own; admin all.
- `credit_ledger`: customer can read own; only admin can insert.
- `testimonials`: anyone can read where `is_published`; admin all.

Every table that doesn't list "anyone can read" must have RLS enabled with explicit policies. **No table ships without RLS.**

---

## Migrations

- One migration per logical change. Never rewrite history once applied to prod.
- Seed file for `session_types`, the two `photographers`, and a super_admin profile.
- Use Supabase migrations (`supabase/migrations/`) — not an ORM-managed schema.
