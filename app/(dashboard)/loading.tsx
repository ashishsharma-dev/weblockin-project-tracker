export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-xl bg-muted" />
        <div className="h-4 w-96 rounded-lg bg-muted/60" />
      </div>

      {/* Grid of Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-3xl border bg-card p-6 space-y-3">
            <div className="h-4 w-24 rounded-lg bg-muted" />
            <div className="h-8 w-32 rounded-xl bg-muted/80" />
            <div className="h-3 w-40 rounded-lg bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Large Content Block Skeleton */}
      <div className="rounded-3xl border bg-card p-6 space-y-4">
        <div className="h-6 w-36 rounded-lg bg-muted" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="space-y-2">
                <div className="h-4 w-48 rounded-lg bg-muted" />
                <div className="h-3 w-32 rounded-lg bg-muted/50" />
              </div>
              <div className="h-6 w-20 rounded-lg bg-muted/80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
