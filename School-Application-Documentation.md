# SchoolFinder SA — Product Feature Documentation

A platform that lets South African parents and students search, compare, and track applications to schools and universities. The goal is to be the single place where a parent can discover every school in their area, understand the costs and requirements, and never miss an application deadline.

---

## Part 1 — MVP Features

These are the features required for a minimum viable product. The product is not ready to launch without all of these working correctly.

---

### 1. School Search

- A search bar on the homepage that accepts a school name, suburb, or area as input
- Results filtered by:
  - Province (all 9 South African provinces)
  - School type: Public, Model C, Private, University
  - Grade range (e.g. Grade R through Grade 12)
  - Monthly fee range (minimum and maximum in Rands)
- Results sorted by: distance from the user, fee low to high, fee high to low, alphabetical
- Distance calculated from the user's current location when the user grants location access; falls back to province-level sorting when denied
- 20 results per page with pagination

---

### 2. School Result Cards

Every school in the search results must show at a glance:

- School name
- Logo or initials avatar if no logo is available
- School type label (Public / Model C / Private / University)
- Distance from the user's location in kilometres
- Monthly fee range in Rands
- Grades offered (e.g. Grade R to Grade 12)
- A "Save to Shortlist" button
- A "View Details" button linking to the full school profile
- A "Visit Website" button linking to the school's own external website

---

### 3. School Detail Page

A full profile page for each school, accessible via a unique URL. Must include:

**Identity and contact**
- School name, logo, and type
- Physical address
- Embedded map showing the school's location
- Direct link to the school's own website

**Key information panel**
- Monthly or annual fee
- Grades offered
- Language of instruction
- Whether boarding is available
- Province and suburb

**Application deadlines** — the core differentiator of this product
- Opening date for applications (per grade group, e.g. Grade R, Grade 1, Grade 8)
- Closing date for applications
- Application fee if known
- Direct link to the school's own application page
- A visible urgency indicator when a deadline is within 30 days
- A fallback message directing users to check the school's website when dates are unknown

**Open days**
- List of upcoming open day dates, times, and locations
- Indication of whether the event is virtual or in-person
- RSVP link if available
- A fallback message when no open days are listed

**About the school**
- Short description (2–3 sentences)
- Extracurricular activities shown as tags (sports, arts, tech, etc.)
- Curriculum affiliation (e.g. IEB, NSC, Cambridge)

---

### 4. University Detail Page

A separate profile page for universities, following the same structure as school detail pages, with content appropriate for tertiary institutions (faculties, undergraduate fees, application periods).

---

### 5. Shortlist

- Any logged-in user can save up to 10 schools to a personal shortlist
- Shortlisted schools persist across sessions and devices
- The shortlist page shows all saved schools with their key details
- Users can remove schools from the shortlist individually
- The shortlist can be exported as a PDF containing each school's name, fee, deadline, and website link

---

### 6. School Comparison

- Users can select up to 3 schools to compare side by side
- The comparison table shows: fees, grades, school type, distance, boarding availability, curriculum, and application deadline
- Schools can be removed from the comparison individually

---

### 7. Deadline Tracker

- On any school detail page, a logged-in user can click "Remind Me" next to an application deadline
- The reminder is saved to the user's account linked to the specific deadline and the grade they are applying for
- A "My Deadlines" page lists all saved reminders in date order, showing school name, grade, deadline date, days remaining, and a link to apply
- Users can remove individual reminders
- Automated email reminders are sent to the user 30 days before a deadline and again 7 days before

---

### 8. User Account

- A user can register with an email address or sign in with Google
- Email confirmation is required for email registrations
- The account stores the child's grade, province, shortlist, and deadline reminders
- A dashboard shows at a glance: number of shortlisted schools, upcoming deadlines, and recently viewed schools
- The user can sign out from any page

---

### 9. Admin Panel

An internal management interface for the operator, protected by a password:

- Add a new school with all fields
- Edit any existing school's information
- Add, edit, and remove application deadlines for any school
- Add, edit, and remove open day listings for any school
- Toggle a school's "Featured" status, which promotes it on the homepage
- Delete a school with a confirmation step

---

### 10. Featured Schools

- The homepage shows a curated selection of featured schools
- Featured status is controlled by the admin and reserved for a future paid placement product
- Featured schools display a visible badge on their card

---

### 11. Homepage

- A prominent search bar for immediate use
- Value proposition copy explaining what the platform does
- The featured schools section
- A statistics bar showing total schools listed, provinces covered, and how often data is updated
- A call-to-action for users to create an account

---

### 12. Search Engine Optimisation

Every school and university detail page must be discoverable by search engines:

- A descriptive page title including school name, suburb, and fee range
- A meta description covering school name, type, province, and fees
- Open Graph and Twitter card tags so that sharing a page on social media shows a proper preview
- Structured data markup identifying the page as an educational institution
- Canonical URLs to prevent duplicate content penalties
- School detail pages must render their core content without JavaScript so that search engines can index them

---

### 13. Seed Data

The database must be populated at launch with at least 55 real South African schools and universities, covering public schools, Model C schools, private schools, and the five largest universities. Each entry must include real fees, grades, address, and at least one application deadline where publicly available.

---

## Part 2 — Full Product Features

These are the features that take the product from MVP to a complete platform. They should be built in order of user impact.

---

### Phase 2 — Growth and Discovery

**Sitemap and search engine submission**
- An automatically generated sitemap listing every school and university page
- A robots file pointing crawlers to the sitemap
- Submission to Google Search Console and Bing Webmaster Tools

**Province landing pages**
- Dedicated pages for each of the 9 provinces listing the schools in that province with introductory copy (e.g. "Private schools in Gauteng")
- These pages help capture search traffic for location-specific queries

**Enhanced 404 page**
- When a user lands on a page that does not exist, show a search form so they can find what they were looking for

**Analytics**
- Track pageviews, search queries submitted, shortlist additions, and deadline reminders set
- Data must be privacy-respecting and compliant with South African data protection law (POPIA)

**Contact and FAQ pages**
- A contact page with a form or email address for parents and schools to reach the operator
- A FAQ page answering: how data is sourced, how a school can claim or correct their listing, and how reminders work

**Legal pages**
- A privacy policy covering what data is collected, why, and how it is stored — required under POPIA
- Terms of use disclaiming that fee and deadline data should be verified on the school's own website

---

### Phase 3 — User Engagement

**Reviews and ratings**
- Verified parents can leave a rating (1–5 stars) and a written review of a school
- Reviews are moderated before publication
- Aggregate star rating is shown on school cards and detail pages
- Schools can flag inappropriate reviews for admin review

**Recently viewed schools**
- The user's account dashboard shows the last 10 schools they visited
- No login required for the browsing history — stored locally on the device

**Application status tracker**
- Users can mark a deadline reminder with a status: Not Started, In Progress, Submitted, Accepted, Rejected
- The My Deadlines page shows statuses alongside dates
- A progress overview on the dashboard shows how many applications are in each state

**Push notifications**
- Browser push notifications as an alternative to email reminders for deadline alerts
- Users opt in per reminder

**Notification preferences**
- Users control whether they receive email reminders, push notifications, or both
- Users can unsubscribe from all notifications without deleting their account

---

### Phase 4 — Data Depth

**School claim and verification**
- A school administrator can submit a claim on their school's listing
- Once verified by the operator, the school administrator can update their own fees, deadlines, open days, and description directly
- Claimed schools show a "Verified by school" badge

**Comprehensive school coverage**
- Expand the database to cover all provinces and all school types across South Africa, targeting 4,000+ schools
- Automated or semi-automated data refresh process for fees and deadlines each year

**Historical fee tracking**
- Store fee data year by year so users can see whether fees have increased and by how much

**Waitlist tracking**
- Schools can indicate that they have a waitlist for certain grades
- Users can add themselves to a school's waitlist notification — they receive an alert if a place opens

**Document uploads for schools**
- Schools can upload their prospectus and fee schedule as downloadable PDFs directly on their detail page

---

### Phase 5 — Monetisation

**Featured listings**
- Schools pay to appear in the featured section on the homepage and at the top of search results for their province and type
- The admin panel manages featured status and billing periods

**Premium school profiles**
- Schools pay for an enhanced profile including a gallery, a video embed, and a direct message button for parents
- Premium profiles are visually distinct from standard listings

**Premium user accounts**
- Parents pay for an upgraded account that removes the 10-school shortlist cap, enables application status tracking, and provides a personalised deadline calendar export

**Advertising**
- Display advertising from education-adjacent brands (tutoring services, uniform suppliers, stationery) shown to non-premium users
- Ads are clearly labelled and never appear on premium accounts

---

### Phase 6 — Platform Expansion

**In-app application submission**
- Schools that opt in can accept applications directly through the platform
- Parents fill in the application form once; the data is shared with the school
- Application fees are paid online
- The school receives applications in a dashboard and updates their status, which is reflected in the parent's account

**Tutor and transport marketplace**
- Parents can search for registered tutors near a school
- Parents can search for registered transport providers (school runs) near a school
- Tutors and transport providers pay a listing fee or a per-lead fee

**Bursary and scholarship directory**
- A searchable directory of bursaries and scholarships available to South African students
- Filterable by grade, subject, province, and school type
- Each entry shows the value, eligibility criteria, and application deadline

**After-school and holiday programme listings**
- A directory of after-school care, holiday camps, and enrichment programmes linked to or near specific schools

**Mobile application**
- Native applications for iOS and Android offering the same core features as the web product
- Push notifications for deadline reminders
- Offline access to shortlisted schools

**Multi-language support**
- The interface available in Afrikaans and at least two other official South African languages (isiZulu and isiXhosa as priorities)
- School descriptions translated where the school provides them

---

### Phase 7 — Institutional and B2B

**School group accounts**
- A single login for a school group (e.g. a private school company operating multiple campuses) to manage all their listings from one admin interface

**Data API**
- A paid API allowing third parties (education portals, newspapers, comparison sites) to access school data, deadline information, and availability

**Counsellor accounts**
- Educational counsellors and placement agencies get a professional account that manages shortlists and applications for multiple student clients at once
- Clients can be invited to view their shortlist and application statuses

**Reporting and insights for schools**
- Schools that have claimed their listing can see anonymised data: how many users viewed their profile, how many shortlisted them, and how many clicked through to their application page
- Trend data compared to the same period last year

---

## Summary

| Stage | What it unlocks |
|-------|----------------|
| MVP | Parents can find, compare, and track applications to schools — the core value |
| Phase 2 | Search engines discover the platform, organic traffic grows |
| Phase 3 | Users return and engage more deeply with their applications |
| Phase 4 | Data becomes authoritative and self-sustaining through school participation |
| Phase 5 | The platform generates revenue without compromising user trust |
| Phase 6 | The platform becomes the end-to-end application layer for SA education |
| Phase 7 | Institutional clients and B2B revenue diversify the business |
