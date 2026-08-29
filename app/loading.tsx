import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
