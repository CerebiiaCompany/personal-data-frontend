import Skeleton from "@/components/base/Skeleton";

export function DashboardCreditsCardSkeleton() {
  return (
    <div className="relative h-full min-h-[160px] overflow-hidden rounded-[20px] bg-[linear-gradient(103deg,_#1C4DC8_0%,_#2F63EE_52%,_#3E71F5_100%)] px-6 py-5">
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[#4C79F0]/45" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-2.5">
          <div className="skeleton-shimmer-light h-[18px] w-[18px] rounded-[5px]" />
          <div className="skeleton-shimmer-light h-4 w-36 rounded-lg" />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="skeleton-shimmer-light h-11 w-28 rounded-lg" />
          <div className="skeleton-shimmer-light h-4 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatCardSkeleton() {
  return (
    <div className="flex min-h-[128px] flex-col justify-between rounded-2xl border border-[#E5EBF7] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(15,35,70,0.04)]">
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div>
        <Skeleton className="mb-2 h-10 w-16" />
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  );
}

export function DashboardChartSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-1 flex-col gap-4 py-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 items-center gap-3">
          <Skeleton className="col-span-4 h-4" />
          <Skeleton className="col-span-6 h-4 rounded-full" />
          <Skeleton className="col-span-2 h-4" />
        </div>
      ))}
    </div>
  );
}

export function DashboardActivitySkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="rounded-xl border border-[#E6ECF7] bg-[#FAFCFF] px-3 py-2.5"
        >
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DashboardDataOfficerSkeleton() {
  return (
    <article className="rounded-2xl border border-[#E8EDF7] bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-5 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-36 shrink-0 rounded-xl" />
      </div>
    </article>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <section className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.03)] md:px-6 md:py-5">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-[38px] w-[92px] rounded-xl" />
            <Skeleton className="h-[38px] w-[76px] rounded-xl" />
            <Skeleton className="h-[38px] w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
