"use client";

import { Check, Cloud, CloudOff, Loader2 } from "lucide-react";
import type { SaveStatus } from "@/types";

export function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs text-amber-400 font-medium">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Đang đồng bộ...</span>
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
        <Check className="h-3 w-3" />
        <span>Đã lưu</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-xs text-red-400 font-medium">
        <CloudOff className="h-3 w-3" />
        <span>Chưa lưu được</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400">
      <Cloud className="h-3 w-3 text-indigo-400" />
      <span>Autosave bật</span>
    </div>
  );
}
