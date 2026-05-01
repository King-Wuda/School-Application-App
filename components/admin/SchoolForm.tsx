"use client";

import { useFormStatus } from "react-dom";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PROVINCES, type School, type SchoolType } from "@/lib/types";

interface Props {
  action: (formData: FormData) => void;
  initial?: Partial<School>;
  submitLabel?: string;
}

export function SchoolForm({ action, initial = {}, submitLabel = "Save" }: Props) {
  return (
    <form action={action} className="space-y-6">
      <Section title="Basics">
        <Grid>
          <Field label="Name" required>
            <Input name="name" defaultValue={initial.name ?? ""} required />
          </Field>
          <Field label="Slug" hint="Leave blank to auto-generate from name">
            <Input name="slug" defaultValue={initial.slug ?? ""} />
          </Field>
          <Field label="Type" required>
            <Select
              name="type"
              defaultValue={(initial.type as SchoolType) ?? "public"}
              required
            >
              <option value="public">Public</option>
              <option value="model_c">Model C</option>
              <option value="private">Private</option>
              <option value="university">University</option>
            </Select>
          </Field>
          <Field label="Province" required>
            <Select name="province" defaultValue={initial.province ?? ""} required>
              <option value="">— Select —</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
        </Grid>
      </Section>

      <Section title="Location">
        <Grid>
          <Field label="Suburb">
            <Input name="suburb" defaultValue={initial.suburb ?? ""} />
          </Field>
          <Field label="Address">
            <Input name="address" defaultValue={initial.address ?? ""} />
          </Field>
          <Field label="Latitude">
            <Input
              type="number"
              step="any"
              name="latitude"
              defaultValue={initial.latitude ?? ""}
            />
          </Field>
          <Field label="Longitude">
            <Input
              type="number"
              step="any"
              name="longitude"
              defaultValue={initial.longitude ?? ""}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Academic">
        <Grid>
          <Field label="Grades from">
            <Input name="grades_from" defaultValue={initial.grades_from ?? ""} placeholder="e.g. Grade R" />
          </Field>
          <Field label="Grades to">
            <Input name="grades_to" defaultValue={initial.grades_to ?? ""} placeholder="e.g. Grade 12" />
          </Field>
          <Field label="Language">
            <Input name="language" defaultValue={initial.language ?? ""} />
          </Field>
          <Field label="Curriculum">
            <Input name="curriculum" defaultValue={initial.curriculum ?? ""} placeholder="IEB, NSC, Cambridge…" />
          </Field>
        </Grid>
      </Section>

      <Section title="Fees & features">
        <Grid>
          <Field label="Monthly fee — min (ZAR)">
            <Input
              type="number"
              name="fee_monthly_min"
              defaultValue={initial.fee_monthly_min ?? ""}
            />
          </Field>
          <Field label="Monthly fee — max (ZAR)">
            <Input
              type="number"
              name="fee_monthly_max"
              defaultValue={initial.fee_monthly_max ?? ""}
            />
          </Field>
          <Field label="Boarding">
            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-navy/15 bg-white px-3">
              <input
                type="checkbox"
                name="boarding"
                defaultChecked={Boolean(initial.boarding)}
              />
              <span className="text-sm">Boarding available</span>
            </label>
          </Field>
          <Field label="Featured">
            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-navy/15 bg-white px-3">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={Boolean(initial.is_featured)}
              />
              <span className="text-sm">Show as featured</span>
            </label>
          </Field>
        </Grid>
      </Section>

      <Section title="Links & media">
        <Grid>
          <Field label="Website URL">
            <Input
              type="url"
              name="website_url"
              defaultValue={initial.website_url ?? ""}
              placeholder="https://…"
            />
          </Field>
          <Field label="Logo URL">
            <Input
              type="url"
              name="logo_url"
              defaultValue={initial.logo_url ?? ""}
              placeholder="https://…"
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Description & extras">
        <Field label="Description">
          <Textarea
            name="description"
            rows={4}
            defaultValue={initial.description ?? ""}
            placeholder="2-3 sentences about the school."
          />
        </Field>
        <Field
          label="Extracurriculars"
          hint="Comma-separated tags (e.g. Rugby, Choir, Debating)"
        >
          <Input
            name="extracurriculars"
            defaultValue={initial.extracurriculars?.join(", ") ?? ""}
          />
        </Field>
      </Section>

      <Submit label={submitLabel} />
    </form>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex justify-end border-t border-navy/10 pt-4">
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : label}
      </Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-navy/10 bg-white p-5">
      <legend className="px-2 text-sm font-semibold text-navy">{title}</legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-navy/50">{hint}</span>}
    </label>
  );
}
