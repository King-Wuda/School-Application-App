import { format, parseISO } from "date-fns";
import type { OpenDay } from "@/lib/types";
import { CalendarIcon, ExternalLinkIcon, MapPinIcon } from "@/components/ui/Icon";

export function OpenDayCard({ openDay }: { openDay: OpenDay }) {
  const date = parseISO(openDay.event_date);
  return (
    <div className="flex items-start gap-4 rounded-xl border border-navy/10 bg-white p-4">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-amber/15 text-amber-700">
        <span className="text-xs font-medium uppercase">
          {format(date, "MMM")}
        </span>
        <span className="font-serif text-xl font-semibold leading-none">
          {format(date, "d")}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-navy">
          {format(date, "EEEE, d MMMM yyyy")}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy/70">
          {(openDay.start_time || openDay.end_time) && (
            <span className="inline-flex items-center gap-1">
              <CalendarIcon size={14} />
              {[openDay.start_time, openDay.end_time].filter(Boolean).join(" – ")}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MapPinIcon size={14} />
            {openDay.is_virtual ? "Virtual" : openDay.location ?? "Main campus"}
          </span>
        </div>
        {openDay.rsvp_url && (
          <a
            href={openDay.rsvp_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-navy hover:underline"
          >
            RSVP <ExternalLinkIcon size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
