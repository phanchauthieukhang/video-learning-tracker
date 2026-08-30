"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ChevronLeft, BookOpen } from "lucide-react";

export default function PlaylistError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Playlist render error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white border-2 border-stone-800 shadow-[6px_6px_0px_#1c1917] p-8 max-w-md w-full space-y-6">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center bg-red-100 border-2 border-red-800 text-red-800 rounded-none shadow-[2px_2px_0px_#991b1b]">
            <AlertCircle className="h-7 w-7 stroke-[2.5]" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-stone-500 uppercase">
            CONNECTION OR RENDER TIMEOUT
          </span>
          <h2 className="font-serif text-xl font-bold text-stone-900">
            Không Thể Tải Mục Lục Bài Giảng
          </h2>
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Cơ sở dữ liệu đám mây đang thức giấc hoặc đường truyền mạng tạm thời gián đoạn. Vui lòng bấm thử lại để tải lại dữ liệu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto rounded-none bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs uppercase font-bold px-4 py-2 border border-stone-900 shadow-[2px_2px_0px_#78716c]"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            <span>Thử Tải Lại</span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-none border border-stone-400 text-stone-800 font-mono text-xs uppercase hover:bg-stone-100"
          >
            <Link href="/dashboard" className="flex items-center justify-center gap-1.5">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Về Bàn Học</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
