import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getSchoolBySlug } from "@/lib/data";
import { SchoolDetail } from "@/components/schools/SchoolDetail";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs("university");
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
  if (!school || school.type !== "university") return { title: "University not found" };
  const title = `${school.name} — Applications, Deadlines & Info`;
  const description =
    school.description ??
    `${school.name} in ${school.province}. Applications, deadlines, open days and more.`;
  const url = absoluteUrl(`/universities/${school.slug}`);
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

export default async function UniversityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const school = await getSchoolBySlug(params.slug);
  if (!school || school.type !== "university") notFound();
  return <SchoolDetail school={school} basePath="/universities" />;
}
