"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "./admin";
import { getSupabaseAdminClient } from "./supabase/admin";
import { slugify } from "./utils";
import type { SchoolType } from "./types";

function guard() {
  if (!isAdminAuthed()) throw new Error("Not authorized");
}

// ─── Schools ───────────────────────────────────────────────────────────────

export async function createSchool(formData: FormData) {
  guard();
  const supabase = getSupabaseAdminClient();
  const base = parseSchoolForm(formData);
  // Resolve slug collisions by appending -2, -3, …
  let slug = base.slug;
  for (let suffix = 2; suffix < 50; suffix++) {
    const { data: existing } = await supabase
      .from("schools")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${base.slug}-${suffix}`;
  }
  const { data: row, error } = await supabase
    .from("schools")
    .insert({ ...base, slug })
    .select("slug")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/schools/${row.slug}`);
  redirect(`/admin/${row.slug}`);
}

export async function updateSchool(slug: string, formData: FormData) {
  guard();
  const supabase = getSupabaseAdminClient();
  const data = parseSchoolForm(formData);
  const { data: row, error } = await supabase
    .from("schools")
    .update(data)
    .eq("slug", slug)
    .select("slug")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/schools/${slug}`);
  revalidatePath(`/schools/${row.slug}`);
  if (row.slug !== slug) redirect(`/admin/${row.slug}`);
}

export async function deleteSchool(slug: string) {
  guard();
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("schools").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleFeatured(slug: string, featured: boolean) {
  guard();
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("schools")
    .update({ is_featured: featured })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/schools/${slug}`);
}

function parseSchoolForm(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  const name = get("name");
  const slug = get("slug") || slugify(name);
  const extras = get("extracurriculars");
  return {
    name,
    slug,
    type: (get("type") || "public") as SchoolType,
    province: get("province"),
    suburb: get("suburb") || null,
    address: get("address") || null,
    latitude: numOrNull(get("latitude")),
    longitude: numOrNull(get("longitude")),
    website_url: get("website_url") || null,
    logo_url: get("logo_url") || null,
    description: get("description") || null,
    grades_from: get("grades_from") || null,
    grades_to: get("grades_to") || null,
    fee_monthly_min: intOrNull(get("fee_monthly_min")),
    fee_monthly_max: intOrNull(get("fee_monthly_max")),
    language: get("language") || null,
    boarding: formData.get("boarding") === "on",
    curriculum: get("curriculum") || null,
    extracurriculars: extras
      ? extras.split(",").map((s) => s.trim()).filter(Boolean)
      : null,
    is_featured: formData.get("is_featured") === "on",
  };
}

// ─── Deadlines ─────────────────────────────────────────────────────────────

export async function upsertDeadline(schoolId: string, schoolSlug: string, formData: FormData) {
  guard();
  const supabase = getSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  const payload: Record<string, unknown> = {
    school_id: schoolId,
    grade_group: str(formData.get("grade_group")),
    open_date: str(formData.get("open_date")) || null,
    close_date: str(formData.get("close_date")) || null,
    application_fee: intOrNull(String(formData.get("application_fee") ?? "")),
    application_url: str(formData.get("application_url")) || null,
    notes: str(formData.get("notes")) || null,
  };
  if (id) {
    const { error } = await supabase.from("deadlines").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("deadlines").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/admin/${schoolSlug}`);
  revalidatePath(`/schools/${schoolSlug}`);
}

export async function deleteDeadline(id: string, schoolSlug: string) {
  guard();
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("deadlines").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/${schoolSlug}`);
  revalidatePath(`/schools/${schoolSlug}`);
}

// ─── Open days ─────────────────────────────────────────────────────────────

export async function upsertOpenDay(schoolId: string, schoolSlug: string, formData: FormData) {
  guard();
  const supabase = getSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  const payload: Record<string, unknown> = {
    school_id: schoolId,
    event_date: str(formData.get("event_date")),
    start_time: str(formData.get("start_time")) || null,
    end_time: str(formData.get("end_time")) || null,
    location: str(formData.get("location")) || null,
    is_virtual: formData.get("is_virtual") === "on",
    rsvp_url: str(formData.get("rsvp_url")) || null,
  };
  if (id) {
    const { error } = await supabase.from("open_days").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("open_days").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/admin/${schoolSlug}`);
  revalidatePath(`/schools/${schoolSlug}`);
}

export async function deleteOpenDay(id: string, schoolSlug: string) {
  guard();
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("open_days").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/${schoolSlug}`);
  revalidatePath(`/schools/${schoolSlug}`);
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function numOrNull(v: string) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function intOrNull(v: string) {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
