import Link from "next/link";
import { isAdminAuthed } from "@/lib/admin";
import { AdminLogin } from "./AdminLogin";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminAuthed()) {
    return (
      <div className="container-page py-10">
        <AdminLogin />
      </div>
    );
  }

  return (
    <div className="container-page py-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-hero text-navy">Admin</h1>
          <p className="text-sm text-navy/60">
            Manage schools, deadlines and open days.
          </p>
        </div>
        <nav className="flex gap-1">
          <Link
            href="/admin"
            className="rounded-md px-3 py-2 text-sm font-medium text-navy/70 hover:bg-navy/5"
          >
            Schools
          </Link>
          <Link
            href="/admin/new"
            className="rounded-md bg-navy px-3 py-2 text-sm font-medium text-cream hover:bg-navy/90"
          >
            + New school
          </Link>
          <form action="/admin/signout" method="post">
            <button
              type="submit"
              className="rounded-md border border-navy/15 px-3 py-2 text-sm font-medium text-navy hover:bg-navy/5"
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
