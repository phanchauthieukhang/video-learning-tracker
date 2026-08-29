"use client";

import Link from "next/link";
import Image from "next/image";
import { cn, formatDuration } from "@/lib/utils";
import { CompletionToggle } from "./completion-toggle";
import { Play } from "lucide-react";
import type { VideoItemData } from "@/types";

interface VideoListItemProps {
  video: VideoItemData;
  isActive: boolean;
  playlistDbId: string;
}

export function VideoListItem({
  video,
  isActive,
  playlistDbId,
}: VideoListItemProps) {
  const indexStr = String(video.position + 1).padStart(2, "0");

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 p-2.5 transition-all duration-150 border",
        isActive
          ? "bg-[#FAF8F5] border-stone-900 shadow-[2px_2px_0px_#1c1917] text-stone-900 font-medium"
          : "bg-white border-stone-200 hover:border-stone-400 hover:bg-[#FBF9F4] text-stone-700 hover:text-stone-950"
      )}
    >
      {/* Completion toggle */}
      <div className="flex items-center justify-center shrink-0">
        <CompletionToggle
          videoId={video.id}
          initialCompleted={video.isCompleted}
        />
      </div>

      <Link
        href={`/playlist/${playlistDbId}?videoId=${video.youtubeVideoId}`}
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        <div className="relative aspect-video w-20 shrink-0 overflow-hidden bg-stone-900 border border-stone-300">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-stone-100 text-xs font-mono text-stone-600">
              #{indexStr}
            </div>
          )}

          {isActive && (
            <div className="absolute inset-0 bg-stone-950/70 flex items-center justify-center text-white">
              <Play className="h-3.5 w-3.5 fill-current text-amber-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold px-1 py-0.2 bg-stone-200 text-stone-800 shrink-0">
              #{indexStr}
            </span>
            <h4
              className={cn(
                "text-xs line-clamp-2 leading-tight font-serif",
                isActive ? "text-stone-950 font-bold" : "text-stone-700 group-hover:text-stone-950 font-medium"
              )}
            >
              {video.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
            {video.durationSeconds ? (
              <span>{formatDuration(video.durationSeconds)}</span>
            ) : null}
            {isActive && (
              <span className="text-blue-800 font-bold uppercase tracking-wider">
                • ĐANG XEM
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
