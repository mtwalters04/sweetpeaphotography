# Admin Pipeline

The studio's operational workflow, modeled as explicit stages. The admin dashboard is built around this.

---

## Booking pipeline (the happy path)

```
INQUIRY      → BOOKED       → SHOOT_SCHEDULED → SHOOT_COMPLETE → EDITING → DELIVERED → ARCHIVED
(custom req)   (deposit pd)   (reminder sent)    (post-shoot)     (cull/    (gallery   (after N
                                                                   edit)     sent)      days)
```

Stored on `bookings.pipeline_stage`. Distinct from `bookings.status` (which tracks the *financial/legal* state — confirmed/cancelled/etc).

| Stage | Trigger to enter | Customer sees | Admin can do |
|---|---|---|---|
| `inquiry` | Custom request submitted | "Request received, we'll respond within 48h" | Quote, decline, ask follow-up |
| `booked` | Stripe webhook confirms deposit (or: custom request accepted + paid) | "You're booked — see details" | Add notes, reassign photographer |
| `shoot_scheduled` | T-7 days before shoot OR admin advances manually | Reminder email sent | Send prep guide, edit details |
| `shoot_complete` | Admin marks complete | "Thanks — galleries in ~2 weeks" | Upload originals to R2 |
| `editing` | Admin marks editing started | "Your gallery is being prepared" | Upload finished web/originals |
| `delivered` | Admin clicks "Deliver gallery" | Email + dashboard download link | Re-send link, extend expiry |
| `archived` | 90 days after delivered (auto) | Read-only history | Re-open if needed |

**Direct bookings skip `inquiry`** — they land in `booked` immediately on Stripe webhook.

---

## Cancellation paths

Each is a status change on `bookings`, not a pipeline_stage change. They terminate the pipeline.

- `cancelled_with_credit` — customer cancelled ≥48h out → ledger entry credits deposit.
- `cancelled_forfeit` — customer cancelled <48h → no credit, no refund.
- `studio_cancelled` — admin cancelled (weather, illness) → ledger entry credits deposit, email sent.

Admin cancellation flow: button on booking detail → modal asking reason → confirm → ledger entry + email + slot returns to `open` (or stays cancelled if reason = weather).

---

## Custom request pipeline

```
SUBMITTED → UNDER_REVIEW → QUOTED → ACCEPTED → BOOKED (joins booking pipeline)
                        ↘ DECLINED
                        ↘ EXPIRED (no customer response in 7d)
                        ↘ WITHDRAWN
```

The customer-facing copy is intentionally calm: no "request denied" — say "we weren't able to fit this one in." Decline reasons are admin-internal.

---

## Admin dashboard surfaces (v1 minimum)

These are the screens. If a screen is not listed, it does not ship in v1.

1. **Today** — landing page. Shoots today, requests awaiting reply, deliveries due, alerts.
2. **Calendar** — month/week view of `available_slots` + `bookings`. Click empty day → publish slot. Click slot → edit/cancel.
3. **Bookings list** — filter by stage, photographer, date range. Bulk advance stage.
4. **Booking detail** — everything about one booking: customer, payment, files, pipeline, notes, email log.
5. **Custom requests** — inbox-style. Triage, quote, decline.
6. **Customers (CRM)** — list with search, tag filter, last-contact age. Per-customer drawer with booking history, credits, notes.
7. **Credits** — recent ledger entries; manual issue form (customer + amount + reason + memo).
8. **Session types** — CRUD on the catalog.
9. **Testimonials** — CRUD + publish toggle + reorder.
10. **Blog** — list, edit (MDX), publish, SEO fields.

Everything else (analytics dashboards, reporting, exports) is **post-v1**.

---

## Notifications matrix

Sent automatically via Resend. Each row is one template.

| Event | To | Template |
|---|---|---|
| Booking confirmed (Stripe webhook) | Customer | `booking_confirmed` |
| Booking confirmed | Admin | `admin_new_booking` |
| Custom request submitted | Customer | `request_received` |
| Custom request submitted | Admin | `admin_new_request` |
| Custom request quoted | Customer | `request_quoted` |
| Custom request declined | Customer | `request_declined` |
| 48h shoot reminder | Customer | `shoot_reminder` |
| Shoot complete | Customer | `post_shoot_thanks` |
| Gallery delivered | Customer | `gallery_ready` |
| Credit issued | Customer | `credit_issued` |
| Studio cancellation | Customer | `studio_cancelled` |

Every send is logged to `email_log`. Admin can resend from booking detail.

---

## Design principle

**Powerful, not complicated.** Every action the admin takes most days (publish a slot, advance a stage, deliver a gallery, issue a credit) should be 1–2 clicks from the Today screen. Rare actions can live deeper.

If during build the admin UI starts feeling like Salesforce, stop and re-read this doc.
