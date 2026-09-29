import { SchoolCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="container-page py-6 sm:py-10" role="status" aria-label="Loading schools">
      <header className="mb-6">
        <h1 className="font-serif text-hero text-navy">Schools</h1>
        <Skeleton className="mt-2 h-5 w-40" />
      </header>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Skeleton className="hidden h-96 rounded-xl lg:block" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <SchoolCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
