"use client";

import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { VideoListItem } from "./video-list-item";
import { CheckCircle2, ListOrdered, BookOpen } from "lucide-react";
import type { VideoItemData } from "@/types";

interface VideoListProps {
  videos: VideoItemData[];
  currentVideoId: string;
  playlistDbId: string;
  playlistTitle: string;
}

export function VideoList({
  videos,
  currentVideoId,
  playlistDbId,
  playlistTitle,
}: VideoListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const completedCount = videos.filter((v) => v.isCompleted).length;
  const percentage = Math.round((completedCount / videos.length) * 100) || 0;

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll(".video-list-item-wrapper");
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        {
          x: -12,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.02,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef }
  );

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentVideoId]);

  return (
    <div className="flex flex-col h-full bg-white border-2 border-stone-800 shadow-[4px_4px_0px_#1c1917] overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b-2 border-stone-800 bg-[#F5F2EB] space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-stone-900 text-white rounded-none">
              <ListOrdered className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-stone-900">
              MỤC LỤC GIÁO TRÌNH
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 bg-white border border-stone-800 text-stone-900">
            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
            <span>{completedCount}/{videos.length}</span>
          </div>
        </div>

        <h3 className="font-serif font-bold text-sm line-clamp-1 text-stone-900" title={playlistTitle}>
          {playlistTitle}
        </h3>

        {/* Progress Bar */}
        <div className="w-full bg-stone-300 h-1.5 border border-stone-400 overflow-hidden">
          <div
            className="h-full bg-stone-800 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Video Items Scrollable List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-[#FAF8F5] scrollbar-thin"
      >
        {videos.map((video) => {
          const isActive = video.youtubeVideoId === currentVideoId;
          return (
            <div
              key={video.id}
              ref={isActive ? activeItemRef : undefined}
              className="video-list-item-wrapper"
            >
              <VideoListItem
                video={video}
                isActive={isActive}
                playlistDbId={playlistDbId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
