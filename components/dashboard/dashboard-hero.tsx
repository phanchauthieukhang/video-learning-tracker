"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { AddPlaylistDialog } from "./add-playlist-dialog";
import { BookOpen, CheckCircle2, Bookmark, GraduationCap, Library, Sparkles } from "lucide-react";
import type { PlaylistSummary } from "@/types";

interface DashboardHeroProps {
  playlists: PlaylistSummary[];
  userName?: string | null;
}

export function DashboardHero({ playlists, userName }: DashboardHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPlaylists = playlists.length;
  const totalVideos = playlists.reduce((acc, p) => acc + p.videoCount, 0);
  const totalCompleted = playlists.reduce((acc, p) => acc + p.completedCount, 0);
  const overallPercentage =
    totalVideos > 0 ? Math.round((totalCompleted / totalVideos) * 100) : 0;

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        ".hero-main-box",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }
      ).fromTo(
        ".stat-ledger-box",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06 },
        "-=0.2"
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Academic Bureau Banner */}
      <div className="hero-main-box p-6 sm:p-8 bg-white border-2 border-stone-800 shadow-[4px_4px_0px_#1c1917] relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-stone-800 bg-[#F5F2EB] text-[11px] font-mono font-bold uppercase tracking-widest text-stone-800">
            <Library className="h-3.5 w-3.5 text-stone-700" />
            <span>ACADEMIC STUDY DESK // SCHOLAR LOG</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Sổ Tay Nghiên Cứu Của{" "}
            <span className="underline decoration-amber-500 underline-offset-4 decoration-2">
              {userName || "Học Viên"}
            </span>
          </h1>

          <p className="text-sm text-stone-600 font-sans leading-relaxed">
            Học tập chuyên sâu qua các bài giảng YouTube không phân tâm, ghi chép luận điểm định dạng Markdown và theo dõi tiến độ hoàn thành.
          </p>
        </div>

        <div className="shrink-0 flex items-center">
          <AddPlaylistDialog />
        </div>
      </div>

      {/* Quick Stats Ledger */}
      {totalPlaylists > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="stat-ledger-box bg-white p-4 border border-stone-300 shadow-[3px_3px_0px_#d6d3d1] flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-stone-900 text-white rounded-none">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">GIÁO TRÌNH / PLAYLIST</p>
              <p className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">{totalPlaylists}</p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="stat-ledger-box bg-white p-4 border border-stone-300 shadow-[3px_3px_0px_#d6d3d1] flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-stone-100 text-stone-800 border border-stone-300 rounded-none">
              <Bookmark className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">TỔNG SỐ BÀI GIẢNG</p>
              <p className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">{totalVideos}</p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="stat-ledger-box bg-white p-4 border border-stone-300 shadow-[3px_3px_0px_#d6d3d1] flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-800 text-white rounded-none">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">ĐÃ HOÀN THÀNH</p>
              <p className="text-xl sm:text-2xl font-serif font-extrabold text-emerald-800 font-mono">
                {totalCompleted} <span className="text-xs font-sans text-stone-500 font-normal">bài</span>
              </p>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="stat-ledger-box bg-white p-4 border border-stone-300 shadow-[3px_3px_0px_#d6d3d1] flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-blue-900 text-white rounded-none">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">TỔNG TIẾN ĐỘ</p>
              <p className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900 font-mono">{overallPercentage}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
