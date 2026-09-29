export type SchoolType = "public" | "model_c" | "private" | "university";

export type SchoolPhase =
  | "primary"
  | "secondary"
  | "combined"
  | "intermediate"
  | "special_needs"
  | "school_of_skills";

/** "Level" filter on the search page. */
export type SchoolLevel = "primary" | "high" | "special_needs";

export const SCHOOL_PHASE_LABELS: Record<SchoolPhase, string> = {
  primary: "Primary school",
  secondary: "High school",
  combined: "Combined (primary + high)",
  intermediate: "Intermediate (Grade R–9)",
  special_needs: "Special needs school",
  school_of_skills: "School of skills",
};

export interface School {
  id: string;
  name: string;
  slug: string;
  type: SchoolType;
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
  created_at: string;
  // Official directory fields (DBE EMIS masterlist). Null for schools not yet imported.
  emis_number?: number | null;
  phase?: SchoolPhase | null;
  special_needs?: boolean | null;
  no_fee_school?: boolean | null;
  quintile?: number | null;
  learner_count?: number | null;
  educator_count?: number | null;
  town?: string | null;
  district?: string | null;
  phone?: string | null;
  urban_rural?: string | null;
  data_source?: string | null;
  // Derived from grades_from / grades_to (Grade R = 0).
  grade_min?: number | null;
  grade_max?: number | null;
}

export interface Deadline {
  id: string;
  school_id: string;
  grade_group: string | null;
  open_date: string | null;
  close_date: string | null;
  application_fee: number | null;
  application_url: string | null;
  notes: string | null;
}

export interface OpenDay {
  id: string;
  school_id: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  is_virtual: boolean;
  rsvp_url: string | null;
}

export interface ShortlistItem {
  id: string;
  user_id: string;
  school_id: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  deadline_id: string;
  grade_applying_for: string | null;
  notified_30_days: boolean;
  notified_7_days: boolean;
  created_at: string;
}

export interface SchoolWithRelations extends School {
  deadlines: Deadline[];
  open_days: OpenDay[];
}

export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export type Province = (typeof PROVINCES)[number];

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  public: "Public",
  model_c: "Model C",
  private: "Private",
  university: "University",
};

export const SCHOOL_TYPE_BADGE_CLASSES: Record<SchoolType, string> = {
  public: "bg-emerald-100 text-emerald-800",
  model_c: "bg-sky-100 text-sky-800",
  private: "bg-amber-100 text-amber-900",
  university: "bg-violet-100 text-violet-800",
};
