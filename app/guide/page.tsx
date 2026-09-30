import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  SearchIcon,
  WalletIcon,
} from "@/components/ui/Icon";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How school applications work in South Africa",
  description:
    "A plain-language guide for parents: when to apply for Grade 1 and Grade 8, how public and independent school admissions differ, which documents you need, and what no-fee schools, quintiles and Model C mean.",
  alternates: { canonical: absoluteUrl("/guide") },
};

const STEPS = [
  {
    icon: SearchIcon,
    when: "Early in the year before",
    title: "Shortlist 3–5 schools",
    body: "Look at distance, fees, language of teaching and whether the school covers the grades you need. Visit open days if you can. Apply to more than one school — popular schools fill up.",
  },
  {
    icon: ClipboardIcon,
    when: "When applications open",
    title: "Apply to each school",
    body: "Public schools in the Western Cape and Gauteng use an online admissions system for Grade 1 and Grade 8. Elsewhere, and for independent schools, you apply directly to the school.",
  },
  {
    icon: CalendarIcon,
    when: "A few months later",
    title: "Accept an offer",
    body: "Schools send offers in rounds. Accept the one you want before its deadline so the place isn't given to someone else, and let the others know.",
  },
  {
    icon: CheckIcon,
    when: "Before the school year",
    title: "Finish enrolment",
    body: "Hand in any outstanding documents, sort out fees or a fee exemption, and ask about uniforms, stationery and transport.",
  },
];

const DOCUMENTS = [
  "Your child's birth certificate (or passport and study permit for non-South African learners)",
  "Immunisation record — the Road to Health booklet — for children starting Grade R or Grade 1",
  "Proof of your home address, such as a utility bill or lease agreement",
  "ID documents of the parents or legal guardians",
  "Your child's latest school report (for Grade 8 and for moving schools)",
  "A transfer card from the current school if your child is changing schools",
];

const PORTALS = [
  {
    province: "Western Cape",
    name: "WCED online admissions",
    href: "https://admissions.westerncape.gov.za",
    note: "Grade 1 and Grade 8 applications to public schools",
  },
  {
    province: "Gauteng",
    name: "GDE online admissions",
    href: "https://www.gdeadmissions.gov.za",
    note: "Grade 1 and Grade 8 applications to public schools",
  },
];

const FAQ = [
  {
    q: "What is a no-fee school?",
    a: "A public school that doesn't charge school fees because the government funds it more heavily. Most no-fee schools are in quintiles 1 to 3. You may still pay for uniforms, stationery and trips.",
  },
  {
    q: "What does the quintile mean?",
    a: "Every public school is placed in a quintile from 1 to 5 based on how poor the surrounding community is. Quintile 1 schools serve the poorest communities and get the most state funding per learner; quintile 5 schools get the least and usually charge fees. It says nothing about teaching quality.",
  },
  {
    q: "What is a Model C school?",
    a: "An informal name for public schools that were reserved for white learners before 1994. Today they are ordinary public schools open to everyone, run by a school governing body that usually sets higher fees.",
  },
  {
    q: "What's the difference between public and independent schools?",
    a: "Public schools are run by the provincial education department and must follow its admission rules. Independent (private) schools are privately owned, set their own fees and admission policies, and often have assessments, interviews and waiting lists.",
  },
  {
    q: "I can't afford the fees at a public school. What now?",
    a: "A public school may not refuse your child because you can't pay fees. Parents who earn below certain income levels can apply to the school for a full or partial fee exemption — ask the school for the form.",
  },
  {
    q: "When can my child start Grade 1?",
    a: "Children usually start Grade 1 in the year they turn seven. Some schools admit children who turn six early in the year — ask the school about its admission policy.",
  },
  {
    q: "What if my child isn't offered a place?",
    a: "Put your child on the waiting list and keep other applications open. If a public school turns you down, you can appeal to the provincial education department — the school must tell you how.",
  },
];

export default function GuidePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <header className="border-b border-navy/10 bg-white">
        <div className="container-page max-w-3xl py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Parent guide</p>
          <h1 className="mt-2 font-serif text-display text-navy">How school applications work</h1>
          <p className="mt-4 text-lg leading-relaxed text-navy/70">
            Applying for Grade 1 or Grade 8 can feel overwhelming. Here&apos;s the whole process in
            plain language, from shortlisting to the first day.
          </p>
        </div>
      </header>

      <div className="container-page max-w-3xl space-y-16 py-12 sm:py-16">
        <section aria-labelledby="timeline">
          <h2 id="timeline" className="font-serif text-2xl text-navy sm:text-3xl">
            The timeline
          </h2>
          <p className="mt-2 text-navy/70">
            In South Africa the school year starts in January, so you apply during the year
            before your child starts.
          </p>
          <ol className="mt-8 space-y-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-5 pb-10 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="absolute left-6 top-12 h-[calc(100%-3rem)] w-px bg-navy/15" />
                )}
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-cream">
                  <s.icon size={20} />
                </span>
                <div className="pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                    Step {i + 1} · {s.when}
                  </p>
                  <h3 className="mt-1 font-serif text-xl text-navy">{s.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-navy/70">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="portals">
          <h2 id="portals" className="font-serif text-2xl text-navy sm:text-3xl">
            Where to apply for public schools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PORTALS.map((p) => (
              <a
                key={p.province}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-navy/10 bg-white p-5 transition hover:border-navy/25 hover:shadow-card-hover"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">{p.province}</p>
                <p className="mt-1 flex items-center gap-2 font-serif text-lg text-navy">
                  {p.name} <ExternalLinkIcon size={14} className="text-navy/40" />
                </p>
                <p className="mt-1 text-sm text-navy/65">{p.note}</p>
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-navy/65">
            In other provinces, and for grades other than 1 and 8, apply directly to the school.
            Dates change every year, so check the department&apos;s site or ask the school.
          </p>
        </section>

        <section aria-labelledby="documents-heading" id="documents" className="scroll-mt-24">
          <h2 id="documents-heading" className="font-serif text-2xl text-navy sm:text-3xl">
            Documents checklist
          </h2>
          <p className="mt-2 text-navy/70">
            Have certified copies ready before applications open. Schools may ask for more.
          </p>
          <ul className="mt-6 divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
            {DOCUMENTS.map((d) => (
              <li key={d} className="flex gap-3 p-4">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckIcon size={13} />
                </span>
                <span className="text-navy/85">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq">
          <h2 id="faq" className="font-serif text-2xl text-navy sm:text-3xl">
            Common questions
          </h2>
          <div className="mt-6 divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-navy">
                  {f.q}
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-lg leading-none text-navy/60 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-navy/70">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-navy p-8 text-cream sm:p-10">
          <WalletIcon size={28} className="text-amber" />
          <h2 className="mt-4 font-serif text-2xl">Ready to start your shortlist?</h2>
          <p className="mt-2 max-w-lg text-cream/75">
            Find schools near you, filter by grade and fees, and save the ones you like to
            compare side by side.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-amber px-5 font-semibold text-navy hover:bg-amber-300"
            >
              Find schools <ArrowRightIcon size={16} />
            </Link>
            <Link
              href="/search?fees=none"
              className="inline-flex h-12 items-center rounded-xl border border-cream/25 px-5 font-medium text-cream hover:bg-cream/10"
            >
              No-fee schools
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
