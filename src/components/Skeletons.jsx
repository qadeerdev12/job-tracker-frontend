const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-line-strong/60 rounded ${className}`} />
);

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-page rounded-xl p-4 border border-line">
          <Pulse className="h-3 w-16 mb-3 rounded-md" />
          <Pulse className="h-8 w-12 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function GoalRingSkeleton() {
  return (
    <div className="flex flex-col items-center shrink-0">
      <Pulse className="h-3 w-20 mb-3 rounded-md" />
      <div className="w-28 h-28 rounded-full border-8 border-line-strong/40 animate-pulse" />
      <Pulse className="h-3 w-14 mt-3 rounded-md" />
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[0, 1].map((i) => (
        <div key={i} className="bg-card rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-4">
            <Pulse className="h-4 w-32 rounded-md" />
            <Pulse className="h-3 w-16 rounded-md" />
          </div>
          <div className="flex items-end gap-3 justify-center h-[240px] pb-6">
            {i === 0 ? (
              <Pulse className="w-[170px] h-[170px] !rounded-full mx-auto" />
            ) : (
              Array.from({ length: 6 }).map((_, j) => (
                <Pulse key={j} className="w-8 !rounded-md" style={{ height: `${40 + Math.random() * 120}px` }} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl border border-line p-5">
          <div className="flex items-center gap-3 mb-2">
            <Pulse className="w-9 h-9 !rounded-lg" />
            <div>
              <Pulse className="h-3 w-20 mb-2 rounded-md" />
              <Pulse className="h-7 w-14 rounded-md" />
            </div>
          </div>
          <Pulse className="h-1.5 w-full mt-2 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function JobListSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-line overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_120px_100px_80px] gap-4 px-5 py-3 border-b border-line">
        <Pulse className="h-3 w-10 rounded-md" />
        <Pulse className="h-3 w-14 rounded-md hidden sm:block" />
        <Pulse className="h-3 w-14 rounded-md hidden sm:block" />
        <Pulse className="h-3 w-10 rounded-md ml-auto" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px_80px] gap-4 px-5 py-4 items-center">
            <div className="min-w-0">
              <Pulse className="h-4 w-48 mb-2 rounded-md" />
              <div className="flex gap-2">
                <Pulse className="h-4 w-14 rounded-md" />
                <Pulse className="h-4 w-32 rounded-md" />
              </div>
            </div>
            <Pulse className="h-5 w-16 !rounded-full hidden sm:block" />
            <Pulse className="h-3 w-12 rounded-md hidden sm:block" />
            <div className="hidden sm:flex gap-1 justify-end">
              <Pulse className="h-7 w-7 !rounded-lg" />
              <Pulse className="h-7 w-7 !rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Pulse className="w-8 h-8 !rounded-full shrink-0" />
          <div className="flex-1">
            <Pulse className="h-3.5 w-48 mb-1.5 rounded-md" />
            <Pulse className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
