"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ChevronLeft } from "lucide-react";

export default function PlaylistError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Playlist error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold tracking-tight mb-2">
        Không thể tải thông tin Playlist
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {error.message || "Playlist không tồn tại hoặc bạn không có quyền truy cập."}
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Thử lại</span>
        </Button>
        <Button asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            <span>Về Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
