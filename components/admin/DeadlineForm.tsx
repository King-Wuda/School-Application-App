"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "./ConfirmButton";
import type { Deadline } from "@/lib/types";

interface Props {
  action: (formData: FormData) => void;
  deleteAction?: () => void;
  deadline?: Deadline;
}

export function DeadlineForm({ action, deleteAction, deadline }: Props) {
  const [open, setOpen] = useState(!deadline);
  if (!open && deadline) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-navy/10 bg-white px-4 py-3">
        <div className="text-sm text-navy">
          <span className="font-medium">{deadline.grade_group ?? "Application"}</span>{" "}
          <span className="text-navy/50">
            {deadline.open_date ?? "?"} → {deadline.close_date ?? "?"}
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
                prompt="Delete this deadline? Users who set a reminder for it will lose that reminder."
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
      {deadline && <input type="hidden" name="id" value={deadline.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
            Grade group
          </span>
          <Input
            name="grade_group"
            defaultValue={deadline?.grade_group ?? ""}
            placeholder="Grade R, Grade 8, Undergraduate…"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
            Application fee (ZAR)
          </span>
          <Input
            type="number"
            name="application_fee"
            defaultValue={deadline?.application_fee ?? ""}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
            Open date
          </span>
          <Input type="date" name="open_date" defaultValue={deadline?.open_date ?? ""} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
            Close date
          </span>
          <Input type="date" name="close_date" defaultValue={deadline?.close_date ?? ""} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
          Application URL
        </span>
        <Input type="url" name="application_url" defaultValue={deadline?.application_url ?? ""} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
          Notes
        </span>
        <Textarea name="notes" rows={2} defaultValue={deadline?.notes ?? ""} />
      </label>
      <div className="flex gap-2">
        <SaveBtn label={deadline ? "Update deadline" : "Add deadline"} />
        {deadline && (
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
