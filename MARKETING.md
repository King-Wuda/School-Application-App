# SchoolFinder SA — First 1,000 Users

A playbook for getting the first 1,000 South African parents and students actively using the site. Not a brand campaign, not a paid-ads blitz — this is a scrappy, channel-specific plan that works on a zero-to-small budget.

The goal is **1,000 engaged users in 90 days**, where "engaged" = created an account, shortlisted a school, or set a deadline reminder.

---

## Positioning (what we tell everyone)

**One line:** "Every school in South Africa, in one place. Fees, deadlines and open days — for free."

**Three proof points to repeat everywhere:**
1. **Unbiased** — we don't take money from schools to rank them
2. **Deadline-safe** — email reminders 30 and 7 days before each application closes
3. **Mobile-first** — built for South Africans on slower connections

**Who we're not:** We're not a private-school directory. We're not a rankings site. We're not an application service. Every page pushes users to the school's own website to apply.

---

## Audience priorities (in order of acquisition ease)

| # | Audience | Why they matter first | Why they're easier to reach |
| - | -------- | --------------------- | --------------------------- |
| 1 | **Parents of Grade 6–7 children** (applying to high school 2027) | Actively searching *right now* for info on Grade 8 applications | They're already on Facebook parent groups, asking the exact questions we answer |
| 2 | **Parents of pre-schoolers** (applying to Grade R/Grade 1) | High intent, 12–18-month decision cycle, emotionally invested | Active in suburb-specific WhatsApp and Facebook groups |
| 3 | **Matric learners** (applying to university) | Tight, seasonal window April–July each year; high urgency | Findable on TikTok, Reddit SA, Instagram |
| 4 | **Relocating families** (expats, inter-provincial moves) | They have zero context, so *any* tool is valuable | Concentrated on relocation sites and expat forums |

Start with #1 — every other audience benefits from the same content and data.

---

## The four channels that will carry this (next 90 days)

### 1. SEO — the compounding engine (months 1–12)

Every school page is a long-tail SEO asset. A parent Googling **"Rondebosch Boys' fees 2027"** should find us.

**What to do now:**
- [ ] **Deploy and submit sitemap** — `app/sitemap.ts` that lists every `/schools/<slug>` and `/universities/<slug>`. Submit to Google Search Console and Bing Webmaster.
- [ ] **Register a `.co.za` domain** — `schoolfinder.co.za` or similar. Not `.com`. South Africans trust `.co.za`.
- [ ] **Write programmatic meta descriptions** — we have good page titles; verify every school's meta description includes `{name} {suburb} {fees} {grade range}`.
- [ ] **Build province-level landing pages** — `/schools/gauteng/private`, `/schools/western-cape/primary-schools`, etc. Even with thin content, these rank for "private schools in Johannesburg".
- [ ] **Add a comparison landing page for each pair** — "Bishops vs SACS fees 2027" is a *massively* high-intent search.
- [ ] **Publish 6 evergreen guides in the first month:**
   1. "How to apply to Grade 8 in Gauteng (2027 deadlines)"
   2. "WCED vs GDE admissions: differences explained"
   3. "What is a Model C school? (and how it differs from public and private)"
   4. "IEB vs NSC: which matters for university?"
   5. "2027 application deadline calendar for every major SA school"
   6. "How much does private school actually cost in 2026?"

**Why this works:** South African school-admission keywords are underserved. Most results are news articles, not structured tools. Every guide links to 5–10 school pages; every school page links back to guides. Google loves this.

**KPI:** 10k organic visits/month by Day 90.

---

### 2. Facebook parent groups — the viral vector (weeks 1–12)

This is where SA parents actually hang out. Almost every suburb has a "<Suburb> Moms" or "<Suburb> Parents" group, and school admissions is one of the single most-asked questions.

**The list (join these now):**
- Johannesburg Moms / Johannesburg Parents (100k+ members)
- Parenting in South Africa
- Cape Town Moms / Cape Town Parenting
- Pretoria Parents
- Durban Parents
- Fourways / Bryanston / Sandton / Constantia / Rondebosch / Bedfordview Moms (suburb-specific)
- Gauteng School Admissions 2027 (these spring up each year)
- "Schools in Johannesburg" / "Schools in Cape Town"

**The playbook (DO NOT spam):**

Group posts get banned fast when they feel like ads. Instead:

1. **Wait for a question you can answer.** ("Does anyone know when Grade 8 applications open at X?") → reply with the exact answer *from your own site*, and include a link **only if the question needs more context**.
2. **Post useful content, not links.** Make a carousel: "2027 application deadlines for Joburg schools — closing soonest first". Put the SchoolFinder SA watermark in the corner. Parents will screenshot and share it.
3. **Ask for feedback, not signups.** "Hi all — I'm a parent who built a free tool for comparing school fees across SA. Would love honest feedback on what's missing — I'm adding schools based on demand. [link]". This is allowed because it's not promotional — it's a feedback ask.
4. **Offer to add their favourite school.** Post: "I've listed 55 schools so far — reply with a school I should add and I'll have it live by Friday." This gets reach and generates real community value.

**KPI:** 150 signups/month from groups by Month 3.

---

### 3. Direct school partnerships (weeks 2–8)

Schools want reach. We give them a free listing that's genuinely useful. Quid pro quo: they promote us to their applicant pipeline.

**The ask:**
> "We built a free, unbiased site listing every SA school. Your page already exists — here's the link. Would you be willing to share it in your next admissions newsletter, or with families who enquire but don't apply? No cost, no catch. We're building a tool that reduces the admissions admin burden on your end."

**Who to email first (tier by ease of yes):**

| Tier | Who | Why they say yes |
| - | - | - |
| A | Smaller Model C / mid-tier private schools (R10k–R18k/month) | Fighting for enrolment, hungry for any marketing channel |
| B | Catholic / co-ed independents in Gauteng and WC (Sacred Heart, Dainfern, SAHETI, Cedar House) | Less-famous but well-run — they compete for mindshare |
| C | Top-brand schools (Bishops, St John's, Roedean) | Slow to respond but legitimising once they agree |
| D | Universities (UCT, Wits, UP) — admissions marketing teams | They already run large digital campaigns and may list us on resource pages |

**The pitch email:** 4 sentences, zero jargon, one link. Target the head of admissions or the marketing manager (not the principal). Pre-populate their school page with fresh data as a gift.

**KPI:** 8 school partnerships by Month 3, each driving 20–50 users/month.

---

### 4. Educational content on TikTok + Instagram (weeks 3–12)

The Matric audience is not on Facebook. It's on TikTok.

**Content pillars:**
1. **"Deadline of the day"** — 20-second videos naming a school closing application that week. Script: "If you want to apply to X for 2027, you have 9 days left. Here's the link."
2. **"School explained in 30 seconds"** — quick profiles of lesser-known but excellent schools (e.g. "Everyone knows Bishops. Here's Herschel, its sister school — and why some parents prefer it").
3. **"Fee myth-busting"** — "A parent told me Model C schools are basically free. Here's what they actually cost in 2026: ..."
4. **"Compare two schools"** — screen-record of our own compare tool, narrating the differences.

**Post cadence:** 3–4 videos/week. Crosspost to Instagram Reels same day. Every caption has a link in bio pointing to `/search` or a specific guide.

**Hashtags to trial:** `#southafricanparents`, `#gradecoded`, `#schoolsSA`, `#matric2027`, `#schooladmissions`

**KPI:** Single video reaches 10k+ views by Week 4. By Week 12, consistent 50k+ monthly reach.

---

## Launch sequence (week-by-week)

### Week 0 — Pre-launch (before any users)
- [ ] Domain registered + Vercel deployed with HTTPS
- [ ] Google Search Console verified + sitemap submitted
- [ ] Plausible or Umami analytics wired (privacy-respecting, not Google Analytics — matters for trust with SA parents)
- [ ] Basic email list (ConvertKit free tier) — "Get deadline alerts for your province" opt-in on homepage
- [ ] 5 friends-and-family testers have used it and set reminders

### Week 1 — Soft launch
- [ ] Personally DM ~20 parents you know with: "Would love your feedback — 30 seconds."
- [ ] Post in 2 small suburb FB groups asking for feedback (not promotion)
- [ ] Ship Guide #1 ("How to apply to Grade 8 in Gauteng")
- [ ] **Target: 50 users**

### Week 2 — Broaden
- [ ] 3 guides live
- [ ] Post weekly "deadlines this week" carousel in 5 FB groups
- [ ] Email 10 Tier-A schools
- [ ] First TikTok video
- [ ] **Target: 150 users**

### Weeks 3–4 — Momentum
- [ ] All 6 guides published
- [ ] Province landing pages live
- [ ] 3 TikTok videos published
- [ ] 2 school partnerships signed
- [ ] **Target: 300 users**

### Weeks 5–8 — Scale the working channels
- [ ] Whichever of {SEO, FB, schools, TikTok} converted best gets 60% of your time
- [ ] Paid experiments (see below) if CPA looks good
- [ ] **Target: 600 users**

### Weeks 9–12 — Land the remaining 400
- [ ] Seasonal push: April–July is SA university application season — ride it
- [ ] Press outreach (News24, Daily Maverick, Parent24) with "we tracked every school's deadline and here's what we found" data story
- [ ] Referral incentive: "Invite 3 parents, unlock compare for 5 schools instead of 3" (or similar soft upsell)
- [ ] **Target: 1,000 users**

---

## Optional: paid channels (only if organic is working)

Spend nothing on ads in the first month. Paid only makes sense once organic tells you **which message converts**.

**If and when you do spend:**
- **Google Search ads** — bid on `"<school name> fees 2027"`, `"<school name> open day"`, `"<school name> application"`. These are cheap because most schools don't bid on their own name for admissions traffic. Target: R2–R8 CPC. **Only** send them to the matching school's detail page.
- **Meta ads** — parent-targeted, suburb-geo-targeted, lead-form ("Get Grade 8 deadline alerts for your area"). Creative: a single screenshot of our deadline tracker, no stock photos.

**Budget to start:** R500/week for 2 weeks in Google, R500/week for 2 weeks in Meta. Kill what doesn't beat R5 per signup.

---

## Metrics — what to watch weekly

| Metric | Where | Target Day 30 | Target Day 90 |
| ------ | ----- | ------------- | ------------- |
| Signups (accounts) | Supabase `auth.users` | 150 | 1,000 |
| Shortlists created | `shortlists` table | 60 | 500 |
| Deadline reminders set | `reminders` table | 40 | 400 |
| Organic sessions | Search Console + analytics | 1,000 | 10,000 |
| School detail pageviews | analytics | 5,000 | 50,000 |
| Avg. shortlisted schools per user | derived | 2.5+ | 3.5+ |
| Deadline-email open rate | Resend dashboard | 40%+ | 40%+ |

**The North Star:** *number of users who set at least one deadline reminder*. This is the single best predictor of retention — they'll come back when the 30/7-day email arrives.

---

## Content calendar template (fill this in weekly)

| Date | Channel | Asset | CTA | Status |
| ---- | ------- | ----- | --- | ------ |
| 28 Apr | SEO | Guide: Grade 8 Gauteng deadlines | /guides/gauteng-grade-8 | ☐ |
| 28 Apr | FB (Johannesburg Moms) | Deadline carousel, 5 slides | Link in first comment | ☐ |
| 30 Apr | TikTok | "Bishops in 30 seconds" | Link in bio | ☐ |
| 02 May | School outreach | 5 emails to Tier A | Inclusion + share | ☐ |

Keep this table in a pinned Notion or Google Doc and review Monday mornings.

---

## What will go wrong (and how to handle it)

- **Schools object to their data being listed.** → Offer a single-click "claim this page" flow. Let them correct fees/deadlines themselves. Never take a page down — you have the right to list factual public information.
- **Competitors clone the site.** → Good. It validates the market. Win on data freshness and deadline-tracking trust.
- **Facebook groups ban your posts.** → Expected. Use different admins' accounts, post less frequently, and prioritise **comments on existing questions** over new posts.
- **A school sends a legal letter about accuracy.** → Reply within 48 hours, fix the data, thank them publicly, and turn it into a "How we keep data accurate" blog post.
- **Growth stalls at 300 users.** → It's almost always the **reminder email** or the **content depth** that's weak. Improve email copy first, then publish 3 more guides, then open a new channel.

---

## The mindset

- **Do things that don't scale.** Hand-email every school. Reply to every comment. Personally follow up with your first 100 users.
- **One channel at a time.** Don't dilute. Prove SEO works, *then* layer on FB. Prove FB works, *then* TikTok.
- **Publish even when it's rough.** A half-finished guide with real data beats no guide. Parents are searching *now*.
- **Trust the flywheel.** Every school page you improve, every deadline you verify, every email you send — they compound. 1,000 users is just 12 users a day for three months.

Build, measure, repeat. The audience is there — they're searching this exact thing today.
