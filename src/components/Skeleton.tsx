import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#f0ece4]",
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[20px] bg-[#f0ece4] animate-pulse", className)} />
  );
}

export function SkeletonText({ className, width = "w-full" }: { className?: string; width?: string }) {
  return (
    <div className={cn("h-3.5 rounded-md bg-[#f0ece4] animate-pulse", width, className)} />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-[20px] p-4 flex flex-col gap-3 bg-[#faf7f3]">
      <div className="h-8 w-8 rounded-[10px] bg-[#f0ece4] animate-pulse" />
      <div className="space-y-2">
        <div className="h-2.5 w-12 rounded bg-[#f0ece4] animate-pulse" />
        <div className="h-7 w-10 rounded bg-[#e8e3db] animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonRepoCard() {
  return (
    <div className="flex items-center gap-3 bg-[#faf7f3] rounded-2xl p-3.5">
      <div className="h-9 w-9 rounded-xl bg-[#e8e3db] animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 rounded bg-[#e8e3db] animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-[#f0ece4] animate-pulse" />
      </div>
      <div className="h-8 w-8 rounded-xl bg-[#e8e3db] animate-pulse shrink-0" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3.5 py-3 border border-[#f0ece4] bg-[#faf7f3]" style={{ minHeight: 56 }}>
      <div className="h-9 w-9 rounded-2xl bg-[#e8e3db] animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 rounded bg-[#e8e3db] animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-[#f0ece4] animate-pulse" />
      </div>
    </div>
  );
}
