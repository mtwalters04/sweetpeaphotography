---
name: sweetpea-photography
description: Coding standards and full architecture guide for the Sweet Pea Photography website — a two-photographer studio site (portrait + events) that doubles as a portfolio and a sales funnel. Stack: Next.js (App Router) on Vercel + Supabase (Postgres/Auth/RLS) + Cloudflare R2 (file storage) + Stripe (30% deposits, no refunds — credits only) + Resend (transactional email). Includes a custom SEO-tuned blog ("Journal") and a custom CRM/admin pipeline. ALWAYS load this skill for any task in the sweetpeaphotography repo — even generic-sounding asks like "add a form" or "fix the API" must stay consistent with the project's two-track booking model (published slots vs. custom requests), credit-only refund policy, photographer assignment, and "quiet luxury / minimalist / moody" design language.
---

# Sweet Pea Photography — Project Skill

This skill is a pointer. The full project context lives in the repo root and is **required reading** before doing any work.

## Required reading order

1. `CLAUDE.md` — eagle-eye view, non-negotiables, money rules, aesthetic.
2. The doc(s) that match the task:
   - Infra/services/auth/payments → `docs/ARCHITECTURE.md`
   - Database/schema/RLS → `docs/DATA_MODEL.md`
   - Admin UI / booking lifecycle → `docs/ADMIN_PIPELINE.md`
   - Any UI work → `docs/DESIGN_SYSTEM.md`
   - Blog, sitemap, structured data → `docs/SEO_BLOG.md`
   - "What should I build next?" → `docs/BUILD_ORDER.md`

Never skip step 1. Step 2 depends on the task.

## Hard rules (re-stated for emphasis)

- **No cash refunds.** All "refunds" are account credits via the `credit_ledger`.
- **Two booking paths**, both real: published slot purchase **and** custom request → quote → accept.
- **Two photographers**, model `photographer_id` everywhere a booking exists.
- **Account required** for every paying action.
- **RLS on every user-data table.** No exceptions.
- **Stripe webhook** is the only source of truth for payment success — never trust the client.
- **Design ≠ SaaS.** If the UI would feel at home on Linear or Notion's marketing site, it's wrong here.

## When in doubt

Re-read `CLAUDE.md` §9 ("Things AI gets wrong on this kind of project — don't"). If the answer isn't in the docs, ask the user before inventing.
