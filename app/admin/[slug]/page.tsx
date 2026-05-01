import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolBySlug } from "@/lib/data";
import { SchoolForm } from "@/components/admin/SchoolForm";
import { DeadlineForm } from "@/components/admin/DeadlineForm";
import { OpenDayForm } from "@/components/admin/OpenDayForm";
import {
  deleteDeadline,
  deleteOpenDay,
  deleteSchool,
  updateSchool,
  upsertDeadline,
  upsertOpenDay,
} from "@/lib/admin-actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function EditSchoolPage({
  params,
}: {
  params: { slug: string };
}) {
  const school = await getSchoolBySlug(params.slug);
  if (!school) notFound();

  const updateAction = updateSchool.bind(null, school.slug);
  const deleteAction = deleteSchool.bind(null, school.slug);

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Link href="/admin" className="text-sm text-navy/70 hover:underline">
            ← All schools
          </Link>
          <form action={deleteAction}>
            <ConfirmButton
              prompt={`Permanently delete "${school.name}" and all its deadlines and open days? This cannot be undone.`}
              className="inline-flex h-9 items-center rounded-lg bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete school
            </ConfirmButton>
          </form>
        </div>
        <h2 className="font-serif text-2xl text-navy">Edit · {school.name}</h2>
        <p className="mt-1 text-sm text-navy/60">
          <Link href={`/schools/${school.slug}`} className="hover:underline">
            View public page →
          </Link>
        </p>
      </div>

      <SchoolForm action={updateAction} initial={school} submitLabel="Save changes" />

      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">Application deadlines</h3>
        <div className="space-y-3">
          {school.deadlines.map((d) => {
            const upsert = upsertDeadline.bind(null, school.id, school.slug);
            const remove = deleteDeadline.bind(null, d.id, school.slug);
            return <DeadlineForm key={d.id} action={upsert} deleteAction={remove} deadline={d} />;
          })}
          <DeadlineForm action={upsertDeadline.bind(null, school.id, school.slug)} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">Open days</h3>
        <div className="space-y-3">
          {school.open_days.map((o) => {
            const upsert = upsertOpenDay.bind(null, school.id, school.slug);
            const remove = deleteOpenDay.bind(null, o.id, school.slug);
            return <OpenDayForm key={o.id} action={upsert} deleteAction={remove} openDay={o} />;
          })}
          <OpenDayForm action={upsertOpenDay.bind(null, school.id, school.slug)} />
        </div>
      </section>
    </div>
  );
}
