import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getSchoolBySlug } from "@/lib/data";
import { SchoolDetail, describeSchool } from "@/components/schools/SchoolDetail";
import { absoluteUrl, formatSchoolFees } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    // Pre-render the most-visited pages at build time; the rest are rendered
    // on first request and then served from the ISR cache.
    const slugs = await getAllSlugs("non-university", 500);
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const school = await getSchoolBySlug(params.slug);
  if (!school || school.type === "university") return { title: "School not found" };
  const fees = formatSchoolFees(school);
  const title = `${school.name} — Fees, Deadlines & Info`;
  const description =
    school.description ??
    (school.fee_monthly_min != null || school.fee_monthly_max != null
      ? `${describeSchool(school)} Fees: ${fees}.`
      : describeSchool(school));
  const url = absoluteUrl(`/schools/${school.slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${title} | SchoolFinder SA`,
      description,
      images: school.logo_url ? [{ url: school.logo_url }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SchoolDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const school = await getSchoolBySlug(params.slug);
  if (!school || school.type === "university") notFound();
  return <SchoolDetail school={school} basePath="/schools" />;
}
