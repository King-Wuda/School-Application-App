"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "./ConfirmButton";
import type { OpenDay } from "@/lib/types";

interface Props {
  action: (formData: FormData) => void;
  deleteAction?: () => void;
  openDay?: OpenDay;
}

export function OpenDayForm({ action, deleteAction, openDay }: Props) {
  const [open, setOpen] = useState(!openDay);
  if (!open && openDay) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-navy/10 bg-white px-4 py-3">
        <div className="text-sm text-navy">
          <span className="font-medium">{openDay.event_date}</span>{" "}
          <span className="text-navy/50">
            {openDay.start_time ? `${openDay.start_time}–${openDay.end_time ?? ""}` : ""} · {openDay.is_virtual ? "Virtual" : openDay.location ?? "Main campus"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm text-navy hover:underline"
          >
            Edit
          </button>
          {deleteAction && (
            <form action={deleteAction}>
              <ConfirmButton
                prompt="Delete this open day?"
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </ConfirmButton>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="space-y-3 rounded-lg border border-navy/10 bg-white p-4"
    >
      {openDay && <input type="hidden" name="id" value={openDay.id} />}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
            Event date
          </span>
          <Input type="date" name="event_date" defaultValue={openDay?.event_date ?? ""} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
            Start time
          </span>
          <Input type="time" name="start_time" defaultValue={openDay?.start_time ?? ""} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
            End time
          </span>
          <Input type="time" name="end_time" defaultValue={openDay?.end_time ?? ""} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
          Location
        </span>
        <Input name="location" defaultValue={openDay?.location ?? ""} placeholder="Main campus" />
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" name="is_virtual" defaultChecked={openDay?.is_virtual} />
        Virtual event
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
          RSVP URL
        </span>
        <Input type="url" name="rsvp_url" defaultValue={openDay?.rsvp_url ?? ""} />
      </label>
      <div className="flex gap-2">
        <SaveBtn label={openDay ? "Update open day" : "Add open day"} />
        {openDay && (
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function SaveBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
