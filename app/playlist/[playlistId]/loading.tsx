import { Skeleton } from "@/components/ui/skeleton";

export default function PlaylistLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/80 bg-background/95">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 mx-auto">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </header>

      <div className="flex-1 container max-w-7xl px-4 sm:px-6 py-6 mx-auto flex flex-col space-y-6">
        <Skeleton className="h-5 w-36" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          <div className="lg:col-span-8 space-y-5">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="p-4 rounded-xl border border-border/80 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="p-4 rounded-xl border border-border/80 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>

          <div className="lg:col-span-4 h-[750px] rounded-xl border border-border/80 p-3 space-y-2">
            <Skeleton className="h-10 w-full mb-3" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
