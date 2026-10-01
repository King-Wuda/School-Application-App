import type { MetadataRoute } from "next";
import { getSitemapSchools } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const schools = await getSitemapSchools().catch(() => []);
  const staticPages = ["/", "/search", "/guide", "/search?level=primary", "/search?level=high", "/search?fees=none"];
  return [
    ...staticPages.map((p) => ({ url: absoluteUrl(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...schools.map((s) => ({
      url: absoluteUrl(s.type === "university" ? `/universities/${s.slug}` : `/schools/${s.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
