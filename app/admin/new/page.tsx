import { SchoolForm } from "@/components/admin/SchoolForm";
import { createSchool } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default function NewSchoolPage() {
  return (
    <div>
      <h2 className="mb-4 font-serif text-2xl text-navy">Add a new school</h2>
      <SchoolForm action={createSchool} submitLabel="Create school" />
    </div>
  );
}
