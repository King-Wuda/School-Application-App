import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What SchoolFinder SA collects, why, and your rights under POPIA.",
  alternates: { canonical: absoluteUrl("/privacy") },
};

// Who is responsible for the site and how to reach them. Set these in the
// hosting environment — see UPDATE.md.
const OPERATOR = process.env.NEXT_PUBLIC_OPERATOR_NAME || "SchoolFinder SA";
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL || null;
const UPDATED = "1 October 2026";

export default function PrivacyPage() {
  const contact = CONTACT ? (
    <a href={`mailto:${CONTACT}`} className="font-medium underline">
      {CONTACT}
    </a>
  ) : (
    <>the Feedback button on any page</>
  );

  return (
    <article className="container-page max-w-3xl py-12 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Privacy</p>
      <h1 className="mt-2 font-serif text-display text-navy">Your privacy</h1>
      <p className="mt-3 text-sm text-navy/55">Last updated {UPDATED}</p>

      <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6">
        <h2 className="font-serif text-xl text-navy">The short version</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-navy/80">
          <li>You can use SchoolFinder without an account and without giving us your name or email.</li>
          <li>We don&apos;t use advertising trackers or cookies to follow you around.</li>
          <li>We never sell your information or share it with schools.</li>
          <li>We count visits anonymously so we can see what parents use and improve the site.</li>
          <li>If you don&apos;t sign in, your shortlist is saved only in your own browser.</li>
        </ul>
      </div>

      <div className="prose-section mt-10 space-y-10 leading-relaxed text-navy/80">
        <Section title="Who we are">
          <p>
            This website is run by {OPERATOR} (&quot;we&quot;). We are the responsible party for the personal
            information described here under the Protection of Personal Information Act, 2013 (POPIA). For any
            privacy question or request, contact us via {contact}.
          </p>
        </Section>

        <Section title="What we collect and why">
          <h3 className="font-semibold text-navy">If you create an account</h3>
          <p>
            Your email address and password (stored securely by our login provider — we can&apos;t see your
            password), and the schools you save to your shortlist. We use these only to let you sign in and keep
            your shortlist across devices. Signing in uses one essential cookie to keep you signed in.
          </p>

          <h3 className="mt-5 font-semibold text-navy">Anonymous usage statistics</h3>
          <p>
            When you use the site, we record things like which pages were viewed, what was searched for (for
            example &quot;high schools in Paarl, 13 results&quot;), which schools were saved, and whether you clicked
            to call or visit a school. Each visit gets a random ID that is kept in your browser tab and forgotten
            when you close it. We also record your device type (phone, tablet or computer) and the website that
            sent you to us (for example facebook.com).
          </p>
          <p className="mt-3">
            We do <strong>not</strong> store your IP address, name, email or precise location with these
            statistics, and we don&apos;t use cookies for them. If your browser sends a &quot;Do Not Track&quot; or
            &quot;Global Privacy Control&quot; signal, we don&apos;t record them at all.
          </p>

          <h3 className="mt-5 font-semibold text-navy">Your location (only if you ask)</h3>
          <p>
            If you tap &quot;Near me&quot;, your browser asks for permission first. Your location is rounded to
            about 100 metres and used to sort schools by distance. We record only that &quot;near me&quot; was used
            — never where you were.
          </p>

          <h3 className="mt-5 font-semibold text-navy">Feedback</h3>
          <p>
            Whatever you write in the feedback form, plus your email address if you choose to give it so we can
            reply.
          </p>
        </Section>

        <Section title="Who else handles your information">
          <p>
            We use trusted service providers to run the site: Supabase (database and sign-in) and our web host.
            Like any website, their servers briefly process technical data such as IP addresses to deliver pages
            and protect against abuse. These providers may store data outside South Africa, under agreements that
            require them to protect it. We don&apos;t share your information with schools, advertisers or anyone
            else.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Account information is kept until you ask us to delete your account. Anonymous usage statistics are
            deleted automatically after 24 months. Feedback is kept for as long as it helps us improve the site.
          </p>
        </Section>

        <Section title="Your rights">
          <p>Under POPIA you may ask us to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>tell you what personal information we hold about you;</li>
            <li>correct or delete it, including deleting your account;</li>
            <li>stop processing it.</li>
          </ul>
          <p className="mt-3">
            Contact us via {contact} and we&apos;ll respond within 30 days. If you&apos;re unhappy with our
            response, you can complain to the{" "}
            <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="underline">
              Information Regulator
            </a>
            .
          </p>
        </Section>

        <Section title="Children">
          <p>
            SchoolFinder is meant for parents, guardians and learners researching schools. Accounts are for adults;
            we don&apos;t knowingly collect personal information from children.
          </p>
        </Section>

        <Section title="School information">
          <p>
            School details come from the Department of Basic Education&apos;s public schools list and from schools&apos;
            own published information. Fees and dates change — always confirm with the school.
          </p>
        </Section>
      </div>

      <p className="mt-12 text-sm text-navy/55">
        <Link href="/" className="underline">
          Back to SchoolFinder
        </Link>
      </p>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl text-navy">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
