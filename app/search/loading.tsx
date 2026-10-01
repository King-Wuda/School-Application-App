import { SchoolCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div role="status" aria-label="Loading schools">
      <div className="border-b border-navy/10 bg-white">
        <div className="container-page py-5 sm:py-7">
          <Skeleton className="h-8 w-64" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>
      <div className="container-page py-6 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-[272px_1fr]">
          <Skeleton className="hidden h-[480px] rounded-2xl lg:block" />
          <div>
            <Skeleton className="h-5 w-40" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <SchoolCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
