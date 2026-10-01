import { ImageResponse } from "next/og";
import { getSchoolBySlug } from "@/lib/data";
import { formatGradeRange, formatNumber, formatSchoolFees } from "@/lib/utils";
import { SCHOOL_TYPE_LABELS } from "@/lib/types";

const LEVEL: Record<string, string> = {
  primary: "Primary school",
  secondary: "High school",
  combined: "Primary & high school",
  intermediate: "Grade R–9 school",
  special_needs: "Special needs school",
  school_of_skills: "School of skills",
};

/** Share card for one school: name, type, place, and the facts parents ask first. */
export async function renderSchoolOgImage(slug: string) {
  const school = await getSchoolBySlug(slug);
  const name = school?.name ?? "School";
  const sector = school ? (school.type === "private" ? "Independent" : SCHOOL_TYPE_LABELS[school.type]) : "";
  const level = school?.special_needs ? "Special needs school" : school?.phase ? LEVEL[school.phase] : "School";
  const place = school ? [school.suburb, school.town !== school.suburb ? school.town : null].filter(Boolean).join(", ") : "";
  const facts = school
    ? [
        { label: "Fees", value: formatSchoolFees(school, { compact: true }) },
        { label: "Grades", value: formatGradeRange(school.grades_from, school.grades_to) },
        ...(school.learner_count ? [{ label: "Learners", value: formatNumber(school.learner_count) }] : []),
      ]
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#F9F7F4",
          color: "#0A1628",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {[sector, level].filter(Boolean).map((t) => (
            <div
              key={t}
              style={{ display: "flex", padding: "8px 20px", borderRadius: 999, background: "#0A1628", color: "#F9F7F4", fontSize: 24 }}
            >
              {t}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: name.length > 34 ? 60 : 72, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5 }}>{name}</div>
          {place && <div style={{ marginTop: 16, fontSize: 32, color: "rgba(10,22,40,0.6)" }}>{place}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 48 }}>
            {facts.map((f) => (
              <div key={f.label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 22, color: "rgba(10,22,40,0.55)" }}>{f.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{f.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#D4881A" }}>SchoolFinder SA</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
