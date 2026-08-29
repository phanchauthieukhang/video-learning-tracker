import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/80 bg-background/95">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 mx-auto">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </header>

      <main className="flex-1 container max-w-7xl px-4 sm:px-8 py-8 mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/80 overflow-hidden space-y-3 p-0">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="pt-2 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
