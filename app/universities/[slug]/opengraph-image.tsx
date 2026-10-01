import { renderSchoolOgImage } from "@/lib/og/school-image";

export const alt = "University details on SchoolFinder SA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function UniversityOgImage({ params }: { params: { slug: string } }) {
  return renderSchoolOgImage(params.slug);
}
