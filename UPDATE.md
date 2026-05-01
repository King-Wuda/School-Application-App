# SchoolFinder SA — Pre-Launch Checklist

Status as of **27 April 2026**. This is the running list of what's done, what's left in the code, and what you (the operator) need to do externally before going live.

---

## ✅ Already done (in this repo)

### Product
- [x] Next.js 14 + TypeScript + Tailwind scaffold, mobile-first
- [x] Fraunces + DM Sans fonts, navy/cream/amber palette
- [x] Homepage (hero search, value props, featured schools, stats, CTA band)
- [x] Search page (filters, sort, pagination, distance sort, geolocation)
- [x] School detail page (header, key info, deadlines, open days, about, map)
- [x] University detail page (separate canonical route)
- [x] Compare page (up to 3 schools side-by-side, removable)
- [x] Account dashboard (shortlist count, deadline count, recently viewed)
- [x] Shortlist page (with PDF export)
- [x] My Deadlines page (with one-click remove)
- [x] Login (email + Google OAuth)
- [x] Admin panel (`/admin`) — CRUD for schools / deadlines / open days, featured toggle, delete confirmations

### Infrastructure
- [x] Supabase schema (`supabase/migrations/0001_init.sql`) — tables, indexes, RLS, profile trigger
- [x] Supabase server / browser / admin clients
- [x] Auth middleware
- [x] Edge Function for deadline emails (`supabase/functions/send-deadline-reminders/`)
- [x] Seed script (`npm run seed`) — idempotent, pushes JSON to Supabase

### Data
- [x] 55 real SA schools seeded (15+ public, 15+ Model C, 15+ private, 5 universities)

### SEO / metadata
- [x] Dynamic page titles with name + suburb + fees
- [x] Meta descriptions
- [x] OpenGraph + Twitter card tags
- [x] JSON-LD `EducationalOrganization` / `CollegeOrUniversity` on every detail page
- [x] Canonical URLs

### Quality
- [x] TypeScript strict mode passing
- [x] Production build green (73 prerendered routes, 87.7 kB shared JS)
- [x] Security audit completed and all findings fixed (HMAC admin tokens, sanitised search, RLS, escape rules)
- [x] Timezone-correct deadline math (Africa/Johannesburg)

### Documentation
- [x] [`README.md`](README.md) — full setup
- [x] [`MARKETING.md`](MARKETING.md) — 90-day plan to first 1,000 users
- [x] [`School-Application.md`](School-Application.md) — original spec

---

## 🟠 Code work I deliberately deferred (do these only if you need them)

These are not blockers for launch — they're nice-to-haves you can ship in week 2.

- [ ] **Sitemap.xml** — `app/sitemap.ts` listing every `/schools/<slug>` and `/universities/<slug>`. Big SEO win once submitted to Google Search Console. ~30 min of work.
- [ ] **Robots.txt** — `app/robots.ts` allowing all + pointing to sitemap. ~5 min.
- [ ] **Province landing pages** — `/schools/gauteng`, `/schools/western-cape`, etc. Each lists schools in that province with intro copy. Helps SEO for "private schools in Joburg" etc.
- [ ] **Public 404 / error pages copy** — `app/not-found.tsx` exists but is generic; consider adding a "Search instead" form.
- [ ] **Rate limiting on `/admin/signin`** — single-admin MVP, low risk if password is strong, but worth adding `@upstash/ratelimit` once you go multi-admin.
- [ ] **Reviews & ratings** — explicitly out of MVP per spec, but cards already say "No ratings yet" so the slot is reserved.
- [ ] **In-app application submission** — explicitly out of MVP per spec.
- [ ] **Multi-language UI** (Afrikaans/Zulu) — out of MVP.
- [ ] **PDF export non-Latin font** — fine for Afrikaans; embed a Unicode font if you ever need Zulu/Sesotho diacritics.

---

## 🔴 What YOU need to do before going live

These cannot be done from inside the code — they need accounts, credentials, and domain.

### 1. Supabase project — required
- [ ] Create a Supabase project at <https://supabase.com>
- [ ] Copy the URL and `anon` key from **Project Settings → API**
- [ ] Copy the `service_role` key (keep it secret — server-only)
- [ ] In **SQL Editor**, paste and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
- [ ] In **Authentication → Providers**:
  - Enable **Email** (turn on "Confirm email" for production)
  - Enable **Google**, paste your OAuth client ID + secret, add `<your-domain>/auth/callback` to redirect URLs
- [ ] Run `npm run seed` from your machine to populate the 55 schools

### 2. Domain — required
- [ ] Buy a `.co.za` domain (recommend `schoolfinder.co.za` or similar — South Africans trust `.co.za` over `.com`)
- [ ] Point its DNS to Vercel after step 4

### 3. Resend (deadline emails) — required if you want reminders to actually send
- [ ] Sign up at <https://resend.com>
- [ ] Verify your sending domain (DNS records — takes ~30 min once you own the domain)
- [ ] Create an API key
- [ ] Configure `noreply@<your-domain>` as the sending address

### 4. Vercel deployment — required
- [ ] Push this repo to GitHub
- [ ] Import the repo at <https://vercel.com/new>
- [ ] Add these env vars in **Project Settings → Environment Variables**:
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ADMIN_PASSWORD            ← pick a long random one
  NEXT_PUBLIC_SITE_URL      ← https://your-domain.co.za
  RESEND_API_KEY
  RESEND_FROM_EMAIL         ← "SchoolFinder SA <noreply@your-domain.co.za>"
  ```
- [ ] Add your domain in **Project Settings → Domains** and update DNS

### 5. Edge Function deployment — required for emails
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] `supabase login`
- [ ] `supabase link --project-ref <your-project-ref>`
- [ ] Set secrets:
  ```bash
  supabase secrets set RESEND_API_KEY=re_...
  supabase secrets set RESEND_FROM_EMAIL="SchoolFinder SA <noreply@your-domain.co.za>"
  supabase secrets set PUBLIC_SITE_URL=https://your-domain.co.za
  ```
- [ ] Deploy: `supabase functions deploy send-deadline-reminders --no-verify-jwt`
- [ ] Schedule the daily cron in Supabase SQL editor (see exact snippet in [`README.md`](README.md))
- [ ] Test once manually:
  ```bash
  curl -X POST https://<project>.functions.supabase.co/send-deadline-reminders \
    -H "Authorization: Bearer <service-role-key>"
  ```

### 6. Analytics — strongly recommended
- [ ] Sign up for **Plausible** (<https://plausible.io>) or **Umami** (self-hosted) — privacy-respecting, important for SA parents' trust. Avoid Google Analytics.
- [ ] Add the snippet to `app/layout.tsx` `<head>`
- [ ] Verify events: pageviews, search submits, shortlist adds, reminder sets

### 7. Search Console & sitemap — recommended for SEO
- [ ] Verify ownership of your domain in <https://search.google.com/search-console>
- [ ] Once you build the sitemap (see deferred section above), submit `https://<your-domain>/sitemap.xml`
- [ ] Repeat for Bing Webmaster Tools

### 8. Email & support — recommended
- [ ] Set up `hello@<your-domain>` (Google Workspace, Fastmail, or simple forwarding)
- [ ] Add a "Contact" link to the footer
- [ ] Consider an FAQ page covering: "How is data sourced?", "I'm a school — how do I claim my page?", "How do reminders work?"

### 9. Legal — required
- [ ] **Privacy policy** — you collect email addresses and child grade. POPIA (South African data protection law) requires a published policy. Use a generator like termly.io and customise.
- [ ] **Terms of use** — disclaim accuracy of school data ("always verify on the school's site"). Important if a school disputes a fee figure.
- [ ] Both should be linked from the footer.

### 10. Pre-launch QA — required
Before announcing publicly:
- [ ] Sign up with a real email and confirm magic-link / Google flow works end-to-end
- [ ] Shortlist 3 schools from a phone (use Chrome DevTools mobile emulation if needed)
- [ ] Set a deadline reminder, manually trigger the Edge Function, verify the email arrives in your inbox
- [ ] Compare 3 schools and export the PDF — check it opens cleanly on macOS Preview and a Windows machine
- [ ] Test the admin panel from a fresh browser session (cookie not set)
- [ ] Open `https://<your-domain>/schools/bishops-diocesan-college` and verify in Chrome DevTools:
  - JSON-LD parses without error (Lighthouse → SEO)
  - Lighthouse mobile score ≥ 85 (spec target)
  - Open Graph image shows in <https://opengraph.xyz>
- [ ] Test 404 — visit a slug that doesn't exist
- [ ] Test geolocation prompt — denies cleanly
- [ ] Disable JavaScript and confirm school detail pages still render (server-side, important for SEO)

---

## 🟢 First-week-after-launch operational checklist

These are about staying safe and learning fast, not building.

- [ ] Daily: skim Vercel + Supabase logs for errors
- [ ] Daily: check Resend dashboard — bounce rate, open rate, unsubscribes
- [ ] Daily for first week: read every admin email received (school corrections, parent questions)
- [ ] Weekly: pull the activity numbers from Supabase (`select count(*) from auth.users`, etc.) and graph them
- [ ] Weekly: pick 3 schools whose deadlines passed, verify their next-cycle data is fresh
- [ ] Weekly: review the marketing-plan KPI table in [`MARKETING.md`](MARKETING.md)

---

## Estimated time to launch from here

| Phase | Effort |
| ----- | ------ |
| Supabase setup + migration + seed | 1 hour |
| Domain + Vercel deploy | 1 hour |
| Resend + domain DNS verify | 1 hour (mostly waiting) |
| Edge function deploy + cron | 30 min |
| Analytics wiring | 30 min |
| Privacy policy + terms | 2 hours |
| Pre-launch QA | 2 hours |
| **Total** | **~8 hours over 1–2 days** |

Optional add-ons (sitemap, province pages, FAQ): another **4–6 hours**.

---

## Risks / things to watch

- **A school disputes their fee or contact details** → reply within 48 hours, fix data via the admin panel, thank them publicly. Never silently take a page down.
- **Resend sender reputation** → start by sending to yourself only, then small batches. If you see > 5% bounce rate, slow down.
- **Supabase free tier limits** → 500 MB DB, 50k monthly active auth users. Plenty for getting to 1,000 users; upgrade to Pro at ~5k users.
- **Vercel free tier limits** → 100 GB bandwidth/month. Fine until ~50k MAU.
- **POPIA compliance** → privacy policy must be published before launch. Don't ship without it.

---

When you've ticked everything in section "What YOU need to do before going live" plus the QA list, you're ready to ship. Good luck.
