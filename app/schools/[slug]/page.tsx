import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getSchoolBySlug } from "@/lib/data";
import { SchoolDetail } from "@/components/schools/SchoolDetail";
import { SCHOOL_TYPE_LABELS } from "@/lib/types";
import { absoluteUrl, formatFeeRange } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs("non-university");
    return slugs.slice(0, 200).map((slug) => ({ slug }));
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
  const typeLabel = SCHOOL_TYPE_LABELS[school.type];
  const fees = formatFeeRange(school.fee_monthly_min, school.fee_monthly_max);
  const title = `${school.name} — Fees, Deadlines & Info`;
  const description =
    school.description ??
    `${school.name} is a ${typeLabel.toLowerCase()} school in ${school.suburb ?? school.province}, ${school.province}. ${fees}.`;
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
