"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Play, Video as VideoIcon, BookMarked } from "lucide-react";
import type { PlaylistSummary } from "@/types";

interface PlaylistCardProps {
  playlist: PlaylistSummary;
  index: number;
}

export function PlaylistCard({ playlist, index }: PlaylistCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = cardRef.current;
      if (!el) return;

      const enter = () => {
        gsap.to(el, {
          y: -4,
          boxShadow: "6px 6px 0px #1c1917",
          borderColor: "#1c1917",
          duration: 0.2,
          ease: "power2.out",
        });
      };

      const leave = () => {
        gsap.to(el, {
          y: 0,
          boxShadow: "3px 3px 0px #d6d3d1",
          borderColor: "#d6d3d1",
          duration: 0.2,
          ease: "power2.out",
        });
      };

      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);

      return () => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      };
    },
    { scope: cardRef }
  );

  const isAllCompleted = playlist.videoCount > 0 && playlist.completedCount === playlist.videoCount;
  const volNumber = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={cardRef}
      className="bg-white border border-stone-300 shadow-[3px_3px_0px_#d6d3d1] transition-colors h-full flex flex-col rounded-none"
    >
      <Link href={`/playlist/${playlist.id}`} className="block focus:outline-none h-full flex flex-col">
        {/* Top Academic Header Tape */}
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#F5F2EB] border-b border-stone-300 text-[10px] font-mono font-bold text-stone-600 uppercase tracking-widest">
          <span className="flex items-center gap-1 text-stone-800">
            <BookMarked className="h-3 w-3 text-amber-700" />
            <span>SYLLABUS // VOL. {volNumber}</span>
          </span>
          <span className="text-stone-500">{playlist.videoCount} LECTURES</span>
        </div>

        {/* Thumbnail Frame */}
        <div className="relative aspect-video w-full overflow-hidden bg-stone-900 border-b border-stone-300">
          {playlist.thumbnailUrl ? (
            <Image
              src={playlist.thumbnailUrl}
              alt={playlist.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-400">
              <VideoIcon className="h-10 w-10 opacity-40" />
            </div>
          )}

          {/* Status Badge */}
          {isAllCompleted ? (
            <div className="absolute top-2.5 right-2.5">
              <span className="bg-emerald-800 text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border border-emerald-950 shadow-sm flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Hoàn Tất</span>
              </span>
            </div>
          ) : (
            <div className="absolute bottom-2.5 right-2.5 bg-stone-950/85 text-white font-mono text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1">
              <Play className="h-2.5 w-2.5 fill-current text-amber-400" />
              <span>{playlist.videoCount} Bài</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-4 bg-white">
          <div className="space-y-1.5">
            <h3 className="font-serif font-bold text-base line-clamp-2 leading-snug text-stone-900 hover:text-blue-900 transition-colors">
              {playlist.title}
            </h3>
            {playlist.channelTitle && (
              <p className="text-xs text-stone-500 line-clamp-1 font-medium font-sans">
                Giảng viên: <span className="text-stone-700 font-semibold">{playlist.channelTitle}</span>
              </p>
            )}
          </div>

          {/* Progress Box */}
          <div className="space-y-2 pt-2.5 border-t border-stone-200">
            <div className="flex items-center justify-between text-xs font-mono text-stone-600">
              <span className="text-[11px] uppercase tracking-wider">Tiến trình học:</span>
              <span className="font-bold text-stone-900">
                {playlist.completedCount}/{playlist.videoCount} ({playlist.completionPercentage}%)
              </span>
            </div>
            <div className="relative w-full overflow-hidden bg-stone-200 h-2 rounded-none border border-stone-300">
              <div
                className="h-full bg-stone-800 transition-all duration-300"
                style={{ width: `${playlist.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
