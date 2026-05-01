import { format, parseISO } from "date-fns";
import type { Deadline } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { CalendarIcon, ExternalLinkIcon } from "@/components/ui/Icon";
import { RemindButton } from "@/components/deadlines/RemindButton";
import { daysUntilSa } from "@/lib/utils";

interface Props {
  deadline: Deadline;
  schoolName: string;
}

export function DeadlineCard({ deadline, schoolName }: Props) {
  const close = deadline.close_date ? parseISO(deadline.close_date) : null;
  const daysLeft = deadline.close_date ? daysUntilSa(deadline.close_date) : null;

  let urgency: null | "urgent" | "closed" = null;
  if (daysLeft != null) {
    if (daysLeft < 0) urgency = "closed";
    else if (daysLeft <= 30) urgency = "urgent";
  }

  return (
    <div className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-semibold text-navy">
              {deadline.grade_group ?? "Application"}
            </h3>
            {urgency === "urgent" && (
              <Badge className="bg-red-600 text-white">
                Closing in {daysLeft} day{daysLeft === 1 ? "" : "s"}
              </Badge>
            )}
            {urgency === "closed" && (
              <Badge className="bg-navy/10 text-navy/60">Closed</Badge>
            )}
          </div>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <Row label="Opens" value={fmt(deadline.open_date)} />
            <Row
              label="Closes"
              value={
                close
                  ? `${format(close, "d MMM yyyy")}${
                      daysLeft != null && daysLeft >= 0
                        ? ` · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                        : ""
                    }`
                  : null
              }
            />
            <Row
              label="Application fee"
              value={
                deadline.application_fee != null
                  ? `R${deadline.application_fee.toLocaleString("en-ZA")}`
                  : null
              }
            />
          </dl>
          {deadline.notes && (
            <p className="mt-3 text-sm text-navy/70">{deadline.notes}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {deadline.application_url && (
          <a
            href={deadline.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-navy px-4 text-sm font-medium text-cream hover:bg-navy/90"
          >
            Apply on school site <ExternalLinkIcon size={14} />
          </a>
        )}
        {!deadline.close_date ? (
          <p className="text-sm italic text-navy/60">
            Deadline not confirmed — check school website.
          </p>
        ) : (
          <RemindButton
            deadlineId={deadline.id}
            gradeGroup={deadline.grade_group}
            schoolName={schoolName}
            closeDate={deadline.close_date}
          />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-2">
      <dt className="min-w-[110px] text-navy/50">{label}</dt>
      <dd className="font-medium text-navy">{value ?? "—"}</dd>
    </div>
  );
}

function fmt(d: string | null) {
  if (!d) return null;
  try {
    return format(parseISO(d), "d MMM yyyy");
  } catch {
    return d;
  }
}
