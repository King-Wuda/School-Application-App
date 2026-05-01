/**
 * Seeds Supabase with data from `data/seed-schools.json`.
 *
 * Usage:
 *   1. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   2. Run the schema migration (supabase/migrations/0001_init.sql) in the Supabase SQL editor
 *   3. npm run seed
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

interface SeedSchool {
  slug: string;
  name: string;
  type: string;
  province: string;
  suburb: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  website_url: string | null;
  logo_url: string | null;
  description: string | null;
  grades_from: string | null;
  grades_to: string | null;
  fee_monthly_min: number | null;
  fee_monthly_max: number | null;
  language: string | null;
  boarding: boolean;
  curriculum: string | null;
  extracurriculars: string[] | null;
  is_featured: boolean;
  deadlines: Array<{
    grade_group: string | null;
    open_date: string | null;
    close_date: string | null;
    application_fee: number | null;
    application_url: string | null;
    notes: string | null;
  }>;
  open_days: Array<{
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    is_virtual: boolean;
    rsvp_url: string | null;
  }>;
}

async function main() {
  const file = path.join(process.cwd(), "data", "seed-schools.json");
  const seeds = JSON.parse(fs.readFileSync(file, "utf8")) as SeedSchool[];
  console.log(`Seeding ${seeds.length} schools…`);

  let inserted = 0;
  let skipped = 0;

  for (const s of seeds) {
    const { deadlines, open_days, ...school } = s;

    const { data: existing } = await supabase
      .from("schools")
      .select("id")
      .eq("slug", school.slug)
      .maybeSingle();

    let schoolId: string;
    if (existing?.id) {
      const { error } = await supabase
        .from("schools")
        .update(school)
        .eq("id", existing.id);
      if (error) {
        console.error(`  ! failed to update ${school.slug}: ${error.message}`);
        continue;
      }
      schoolId = existing.id;
      skipped++;
    } else {
      const { data, error } = await supabase
        .from("schools")
        .insert(school)
        .select("id")
        .single();
      if (error || !data) {
        console.error(`  ! failed to insert ${school.slug}: ${error?.message ?? "unknown"}`);
        continue;
      }
      schoolId = data.id;
      inserted++;
    }

    // Wipe and re-insert related rows so re-seeds stay idempotent.
    await supabase.from("deadlines").delete().eq("school_id", schoolId);
    if (deadlines.length) {
      const rows = deadlines.map((d) => ({ ...d, school_id: schoolId }));
      const { error } = await supabase.from("deadlines").insert(rows);
      if (error) console.error(`  ! deadlines for ${school.slug}: ${error.message}`);
    }

    await supabase.from("open_days").delete().eq("school_id", schoolId);
    if (open_days.length) {
      const rows = open_days.map((o) => ({ ...o, school_id: schoolId }));
      const { error } = await supabase.from("open_days").insert(rows);
      if (error) console.error(`  ! open_days for ${school.slug}: ${error.message}`);
    }
  }

  console.log(`Done. ${inserted} inserted · ${skipped} updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
