"use client";

import { useState } from "react";
import type { SchoolWithRelations } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { DownloadIcon } from "@/components/ui/Icon";
import { formatFeeRange, formatGradeRange } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export function ExportPdfButton({
  schools,
}: {
  schools: SchoolWithRelations[];
}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      // Load jsPDF on demand so it doesn't bloat the initial bundle.
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 48;
      let y = margin;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(10, 22, 40);
      doc.text("My School Shortlist", margin, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(
        `Generated on ${format(new Date(), "d MMMM yyyy")} · SchoolFinder SA`,
        margin,
        (y += 14),
      );
      y += 14;

      schools.forEach((s) => {
        ensureSpace(doc, y, 110, () => (y = margin));
        y += 8;
        doc.setDrawColor(230);
        doc.line(margin, y, 595 - margin, y);
        y += 18;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(10, 22, 40);
        doc.text(s.name, margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(70);
        const location = [s.suburb, s.province].filter(Boolean).join(", ");
        doc.text(
          `${typeLabel(s.type)} · ${location || "Location not listed"}`,
          margin,
          y,
        );
        y += 14;

        const kv: [string, string][] = [
          ["Fees", s.type === "university" ? "See website" : formatFeeRange(s.fee_monthly_min, s.fee_monthly_max)],
          ["Grades", formatGradeRange(s.grades_from, s.grades_to)],
          ["Boarding", s.boarding ? "Yes" : "No"],
          ["Curriculum", s.curriculum ?? "—"],
        ];
        kv.forEach(([k, v]) => {
          doc.setTextColor(100);
          doc.text(`${k}:`, margin, y);
          doc.setTextColor(10, 22, 40);
          doc.text(v, margin + 70, y);
          y += 14;
        });

        const next = s.deadlines
          .filter((d) => d.close_date && new Date(d.close_date) >= new Date())
          .sort((a, b) => a.close_date!.localeCompare(b.close_date!))[0];
        if (next) {
          doc.setTextColor(100);
          doc.text("Next deadline:", margin, y);
          doc.setTextColor(180, 60, 60);
          doc.text(
            `${next.grade_group ?? "Application"} — ${format(parseISO(next.close_date!), "d MMM yyyy")}`,
            margin + 100,
            y,
          );
          y += 14;
        }

        if (s.website_url) {
          doc.setTextColor(60, 90, 160);
          doc.textWithLink(s.website_url, margin, y, { url: s.website_url });
          y += 14;
        }
        y += 6;
      });

      doc.save(`shortlist-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={loading || schools.length === 0}
    >
      <DownloadIcon size={16} />
      {loading ? "Preparing…" : "Export as PDF"}
    </Button>
  );
}

function typeLabel(t: SchoolWithRelations["type"]) {
  return { public: "Public", model_c: "Model C", private: "Private", university: "University" }[t];
}

function ensureSpace(
  doc: any,
  y: number,
  needed: number,
  resetY: () => void,
) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 48) {
    doc.addPage();
    resetY();
  }
}
