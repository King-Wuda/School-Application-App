/**
 * Converts a Department of Basic Education (DBE) EMIS "Schools Masterlist"
 * spreadsheet into the directory JSON that `npm run seed` loads.
 *
 * Source (free, official, updated quarterly):
 *   https://www.education.gov.za/Programmes/EMIS/EMISDownloads.aspx
 *   → "Schools Masterlist Data" → download the province's .xlsx
 *
 * Usage:
 *   npm run import:emis -- "path/to/Western Cape.xlsx"
 *
 * Writes data/schools/<province-slug>.json. Schools already in the curated
 * data/seed-schools.json are matched by name + location and keep their
 * curated slug, name, type (e.g. Model C), address, coordinates and grades,
 * so re-importing never duplicates or overwrites hand-checked data.
 */
import fs from "node:fs";
import path from "node:path";
import { readSheet } from "read-excel-file/node";

type Cell = string | number | boolean | Date | null;

const PROVINCE_CODES: Record<string, string> = {
  EC: "Eastern Cape",
  FS: "Free State",
  GT: "Gauteng",
  GP: "Gauteng",
  KZN: "KwaZulu-Natal",
  LP: "Limpopo",
  MP: "Mpumalanga",
  NC: "Northern Cape",
  NW: "North West",
  WC: "Western Cape",
};

// DBE "Phase_PED" → our phase + the standard grade span for that phase.
const PHASES: Record<string, { phase: string; from: string | null; to: string | null }> = {
  "PRIMARY SCHOOL": { phase: "primary", from: "Grade R", to: "Grade 7" },
  "SECONDARY SCHOOL": { phase: "secondary", from: "Grade 8", to: "Grade 12" },
  "COMBINED SCHOOL": { phase: "combined", from: "Grade R", to: "Grade 12" },
  "INTERMEDIATE SCHOOL": { phase: "intermediate", from: "Grade R", to: "Grade 9" },
  "SPECIAL NEEDS EDUCATION SCHOOL": { phase: "special_needs", from: null, to: null },
  "SCHOOL OF SKILLS": { phase: "school_of_skills", from: null, to: null },
};

// Curated schools whose name differs too much from the official one to match
// automatically: curated slug → EMIS number.
const MANUAL_MATCHES: Record<string, number> = {
  "sacs-south-african-college-schools": 105310293, // S.A. College High School
  "reddam-house-constantia": 105007304, // Reddam House (Westlake / Constantia campus)
};

// Placeholder values used in the masterlist's place columns.
const NOT_A_PLACE = /^(OUTSIDE A TOWN|NONE|NULL|0)$/i;

// Not schools a parent applies to.
const EXCLUDED_PHASES = new Set(["HOSPITAL SCHOOL"]);

export interface DirectorySchool {
  emis_number: number;
  slug: string;
  name: string;
  type: "public" | "model_c" | "private";
  province: string;
  suburb: string | null;
  town: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  grades_from: string | null;
  grades_to: string | null;
  phase: string | null;
  special_needs: boolean;
  no_fee_school: boolean | null;
  quintile: number | null;
  learner_count: number | null;
  educator_count: number | null;
  district: string | null;
  phone: string | null;
  urban_rural: string | null;
  data_source: string;
}

interface CuratedSchool {
  slug: string;
  name: string;
  type: string;
  province: string;
  suburb: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  grades_from: string | null;
  grades_to: string | null;
}

async function main() {
  const input = process.argv[2];
  if (!input || !fs.existsSync(input)) {
    console.error('Usage: npm run import:emis -- "path/to/Province.xlsx"');
    process.exit(1);
  }

  const sheet = (await readSheet(fs.readFileSync(input))) as Cell[][];
  const [header, ...body] = sheet;
  const col = indexer(header.map((h) => String(h ?? "").trim()));

  const curated = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "seed-schools.json"), "utf8"),
  ) as CuratedSchool[];

  const out: DirectorySchool[] = [];
  const skipped: Record<string, number> = {};
  const skip = (reason: string) => (skipped[reason] = (skipped[reason] ?? 0) + 1);
  let province = "";
  let dataYear = "";

  for (const row of body) {
    const get = (...names: string[]) => col(row, names);
    const emis = num(get("NatEmis"));
    if (!emis) continue;

    const status = str(get("Status"))?.toUpperCase();
    if (status !== "OPEN") {
      skip(`status ${status}`);
      continue;
    }
    const phaseRaw = str(get("Phase_PED"))?.toUpperCase() ?? "";
    if (EXCLUDED_PHASES.has(phaseRaw)) {
      skip(phaseRaw.toLowerCase());
      continue;
    }

    province = PROVINCE_CODES[str(get("Province"))?.toUpperCase() ?? ""] ?? province;
    if (!province) throw new Error(`Unknown province code: ${get("Province")}`);
    dataYear = String(get("DataYear", "Datayear") ?? dataYear);

    const specialNeeds = /SPECIAL NEEDS/i.test(str(get("Type_DoE")) ?? "");
    const phaseInfo = PHASES[phaseRaw] ?? { phase: null, from: null, to: null };
    const lat = coord(get("GIS_Lat", "GIS_Latitude"));
    const lng = coord(get("GIS_Long", "GIS_Longitude"));
    const noFee = str(get("NoFeeSchool"))?.toUpperCase();
    const quintile = /^Q([1-5])$/.exec(str(get("Quintile")) ?? "");
    const town = place(get("Town_City"));

    out.push({
      emis_number: emis,
      slug: "",
      name: titleCase(fixEncoding(str(get("Official_Institution_Name")) ?? "")),
      type: str(get("Sector"))?.toUpperCase() === "INDEPENDENT" ? "private" : "public",
      province,
      suburb: place(get("Suburb")) ?? place(get("Township_Village")) ?? town,
      town,
      address: address(get("StreetAddress")),
      latitude: lat,
      longitude: lng,
      grades_from: specialNeeds ? null : phaseInfo.from,
      grades_to: specialNeeds ? null : phaseInfo.to,
      phase: specialNeeds && !phaseInfo.phase ? "special_needs" : phaseInfo.phase,
      special_needs: specialNeeds || phaseInfo.phase === "special_needs",
      no_fee_school: noFee === "NO FEE" ? true : noFee === "FEE CHARGING" ? false : null,
      quintile: quintile ? Number(quintile[1]) : null,
      learner_count: positive(get(`Learners${dataYear}`)),
      educator_count: positive(get(`Educators${dataYear}`)),
      district: place(get("EIDistrict")),
      phone: phone(get("Telephone")),
      urban_rural: str(get("Urban_Rural"))?.match(/^(URBAN|RURAL)$/i) ? titleCase(str(get("Urban_Rural"))!) : null,
      data_source: `DBE Schools Masterlist ${dataYear}`,
    });
  }

  // ─── Merge curated schools ───────────────────────────────────────────────
  const curatedHere = curated.filter((c) => c.province === province && c.type !== "university");
  const matchedCurated = new Set<string>();
  for (const c of curatedHere) {
    const match = findMatch(c, out);
    if (!match) continue;
    matchedCurated.add(c.slug);
    Object.assign(match, {
      slug: c.slug,
      name: c.name,
      type: c.type as DirectorySchool["type"],
      suburb: c.suburb ?? match.suburb,
      address: c.address ?? match.address,
      latitude: c.latitude ?? match.latitude,
      longitude: c.longitude ?? match.longitude,
      grades_from: c.grades_from ?? match.grades_from,
      grades_to: c.grades_to ?? match.grades_to,
    });
  }

  // ─── Unique slugs ────────────────────────────────────────────────────────
  const used = new Set(curated.map((c) => c.slug));
  for (const s of out) {
    if (s.slug) continue;
    let slug = slugify(s.name);
    if (used.has(slug) && s.suburb) slug = slugify(`${s.name} ${s.suburb}`);
    if (used.has(slug)) slug = `${slugify(s.name)}-${s.emis_number}`;
    used.add(slug);
    s.slug = slug;
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  const file = path.join(process.cwd(), "data", "schools", `${slugify(province)}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `[\n${out.map((s) => JSON.stringify(s)).join(",\n")}\n]\n`);

  writeIndex(path.dirname(file));

  const count = (pred: (s: DirectorySchool) => boolean) => out.filter(pred).length;
  console.log(`${province}: wrote ${out.length} schools → ${path.relative(process.cwd(), file)}`);
  console.log(
    `  primary ${count((s) => s.phase === "primary")} · secondary ${count((s) => s.phase === "secondary")} · combined ${count((s) => s.phase === "combined")} · intermediate ${count((s) => s.phase === "intermediate")} · special needs ${count((s) => s.special_needs)} · skills ${count((s) => s.phase === "school_of_skills")}`,
  );
  console.log(`  public ${count((s) => s.type !== "private")} · independent ${count((s) => s.type === "private")} · no coordinates ${count((s) => s.latitude == null)}`);
  console.log(`  skipped: ${JSON.stringify(skipped)}`);
  console.log(`  curated schools matched: ${matchedCurated.size}/${curatedHere.length}`);
  for (const c of curatedHere) {
    if (!matchedCurated.has(c.slug)) console.log(`    ! no EMIS match for curated "${c.name}" (${c.slug})`);
  }
}

/** Regenerates data/schools/index.ts so the no-database fallback sees every province. */
function writeIndex(dir: string) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const lines = files.map((f) => `  () => import("./${f}"),`).join("\n");
  fs.writeFileSync(
    path.join(dir, "index.ts"),
    `// Generated by scripts/import-emis.ts — one loader per imported province.
// Loaded lazily so the directory JSON is only read when Supabase isn't configured.
export const DIRECTORY_LOADERS: Array<() => Promise<{ default: unknown }>> = [
${lines}
];
`,
  );
}

// ─── Matching ───────────────────────────────────────────────────────────────

const NAME_NOISE = /\b(THE|SCHOOL|SKOOL|HIGH|HOERSKOOL|LAERSKOOL|PRIMARY|COLLEGE|GIRLS|BOYS|PREPARATORY|PREP|JUNIOR|SENIOR|ACADEMY)\b/g;

function nameKey(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function coreKey(name: string): string {
  return nameKey(name).replace(NAME_NOISE, "").replace(/\s+/g, " ").trim();
}

function findMatch(c: CuratedSchool, rows: DirectorySchool[]): DirectorySchool | null {
  const manual = MANUAL_MATCHES[c.slug];
  if (manual) return rows.find((r) => r.emis_number === manual) ?? null;
  const free = rows.filter((r) => !r.slug);
  const exact = free.filter((r) => nameKey(r.name) === nameKey(c.name));
  if (exact.length === 1) return exact[0];

  // Same core name (ignoring "High School", "Girls'" etc.) and close by.
  const core = coreKey(c.name);
  if (!core) return null;
  const candidates = (exact.length ? exact : free).filter((r) => {
    const rc = coreKey(r.name);
    return rc === core || (rc.length > 3 && (rc.startsWith(core) || core.startsWith(rc)));
  });
  const scored = candidates
    .map((r) => ({ r, km: km(c, r) }))
    .filter((x) => x.km == null || x.km < 5)
    .sort((a, b) => (a.km ?? 99) - (b.km ?? 99));
  if (!scored.length) return null;
  // Several same-named schools and no coordinates to tell them apart → skip.
  if (scored.length > 1 && scored[0].km == null) return null;
  // Prefer the same level (primary vs high) when names are shared.
  const wantsHigh = /high|h[oö]ërskool|college/i.test(c.name) || (c.grades_from ?? "").includes("8");
  const sameLevel = scored.find((x) => (x.r.phase === "secondary" || x.r.phase === "combined") === wantsHigh);
  return (sameLevel ?? scored[0]).r;
}

function km(a: { latitude: number | null; longitude: number | null }, b: { latitude: number | null; longitude: number | null }) {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return null;
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ─── Cell helpers ───────────────────────────────────────────────────────────

function indexer(header: string[]) {
  const idx = new Map(header.map((h, i) => [h.toLowerCase(), i]));
  return (row: Cell[], names: string[]): Cell => {
    for (const n of names) {
      const i = idx.get(n.toLowerCase());
      if (i != null) return row[i] ?? null;
    }
    return null;
  };
}

function str(v: Cell): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s && s !== "99" && s.toUpperCase() !== "UNKNOWN" && s.toUpperCase() !== "N/A" ? s : null;
}

function num(v: Cell): number | null {
  const n = Number(v);
  return v != null && v !== "" && Number.isFinite(n) ? n : null;
}

function positive(v: Cell): number | null {
  const n = num(v);
  return n != null && n > 0 ? Math.round(n) : null;
}

function coord(v: Cell): number | null {
  const n = num(v);
  return n != null && n !== 0 && Math.abs(n) <= 180 ? Math.round(n * 1e6) / 1e6 : null;
}

function place(v: Cell): string | null {
  const s = str(v);
  return s && !NOT_A_PLACE.test(s) ? titleCase(fixEncoding(s)) : null;
}

/** The masterlist stores addresses as fixed-width 30-character columns. */
function address(v: Cell): string | null {
  const s = str(v);
  if (!s) return null;
  const parts = fixEncoding(s)
    .split(/\s{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && p.toUpperCase() !== "UNKNOWN" && p !== "99");
  if (!parts.length) return null;
  const code = /^\d{4}$/.test(parts[parts.length - 1]) ? parts.pop() : null;
  const words = parts.map(titleCase);
  return code ? `${words.join(", ")}, ${code}` : words.join(", ");
}

function phone(v: Cell): string | null {
  const digits = String(v ?? "").replace(/\D/g, "");
  if (digits.length !== 9 && !(digits.length === 10 && digits.startsWith("0"))) return null;
  const d = digits.length === 9 ? `0${digits}` : digits;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/** The masterlist has a few Afrikaans characters mangled by a codepage mix-up. */
function fixEncoding(s: string): string {
  return s.replace(/ﾊ/g, "Ê").replace(/ﾋ/g, "Ë").replace(/`/g, "'").replace(/’/g, "'");
}

const LOWER_WORDS = new Set(["and", "of", "the", "en", "for", "in", "at", "van", "der", "de", "du", "le", "la", "op", "on"]);
const UPPER_WORDS = new Set(["SA", "RC", "RK", "NG", "NGK", "VGK", "AGS", "URCSA", "DRC", "LSEN", "ELSEN", "SDA", "AME", "UCC", "CBC", "ACJ", "II", "III", "IV", "UK", "USA"]);

function titleCase(input: string): string {
  const words = input.toLowerCase().replace(/\s+/g, " ").trim().split(" ");
  return words
    .map((w, i) => {
      const upper = w.toUpperCase().replace(/[^A-Z]/g, "");
      if (UPPER_WORDS.has(upper) && upper.length === w.replace(/[^a-z]/g, "").length) return w.toUpperCase();
      if (i > 0 && LOWER_WORDS.has(w)) return w;
      return w
        .split(/(?<=[-/])/)
        .map((part) =>
          part
            .replace(/^(\(?)(\p{L})/u, (_, p: string, c: string) => p + c.toUpperCase())
            // O'Neill, D'Almeida — but not King's / Boys'
            .replace(/'(\p{L})(?=\p{L}{2})/u, (_, c: string) => `'${c.toUpperCase()}`)
            .replace(/^(Mc)(\p{L})/u, (_, p: string, c: string) => p + c.toUpperCase()),
        )
        .join("");
    })
    .join(" ");
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
