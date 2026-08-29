"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold tracking-tight mb-2">
        Đã xảy ra lỗi khi tải danh sách lộ trình
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {error.message || "Không thể kết nối đến máy chủ hoặc cơ sở dữ liệu."}
      </p>
      <Button onClick={() => reset()} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        <span>Thử lại</span>
      </Button>
    </div>
  );
}
