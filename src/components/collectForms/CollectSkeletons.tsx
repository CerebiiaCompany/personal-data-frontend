import Skeleton from "@/components/base/Skeleton";

export function CollectFormCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E3EAF7] bg-white shadow-[0_4px_14px_rgba(13,42,96,0.05)]">
      <div className="flex w-full flex-col items-start gap-3 py-4">
        <header className="flex min-h-[80px] w-full items-start justify-between gap-3 px-5">
          <Skeleton className="h-12 w-[75%]" />
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </header>

        <div className="flex w-full flex-col items-start gap-1.5 px-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>

        <span className="inline-block h-px w-full bg-[#E7ECF6]" />

        <div className="w-full border-y border-[#DDE6F6] bg-[#F0F5FF] px-5 py-3">
          <Skeleton className="h-5 w-36" />
        </div>

        <div className="flex w-full items-center gap-2 px-5">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CollectFormsListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CollectFormCardSkeleton key={i} />
      ))}
    </>
  );
}
