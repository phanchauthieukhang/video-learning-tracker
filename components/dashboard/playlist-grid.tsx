"use client";

import { useState, useRef, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { PlaylistCard } from "./playlist-card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import type { PlaylistSummary } from "@/types";

interface PlaylistGridProps {
  playlists: PlaylistSummary[];
}

export function PlaylistGrid({ playlists }: PlaylistGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "in-progress" | "completed">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and search logic
  const filteredPlaylists = useMemo(() => {
    return playlists.filter((playlist) => {
      // 1. Search text filter
      const matchesSearch =
        playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (playlist.channelTitle &&
          playlist.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Status filter
      const isCompleted =
        playlist.videoCount > 0 && playlist.completedCount === playlist.videoCount;

      if (filterStatus === "completed") return isCompleted;
      if (filterStatus === "in-progress") return !isCompleted;
      return true;
    });
  }, [playlists, searchQuery, filterStatus]);

  // GSAP staggered reveal on filter/search change
  useGSAP(
    () => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll(".playlist-item");
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 16,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef, dependencies: [filteredPlaylists, viewMode] }
  );

  return (
    <div className="space-y-6">
      {/* Editorial Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border-2 border-stone-800 shadow-[3px_3px_0px_#1c1917]">
        {/* Live Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <Input
            placeholder="Tìm kiếm khóa học, giảng viên, môn học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#FBF9F4] border border-stone-300 text-stone-900 placeholder:text-stone-400 rounded-none focus-visible:ring-stone-900 text-xs font-sans h-9"
          />
        </div>

        {/* Filter Pills & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="flex items-center border border-stone-300 bg-[#F5F2EB] p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 font-semibold uppercase tracking-wider transition-all ${
                filterStatus === "all"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200"
              }`}
            >
              Tất cả ({playlists.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("in-progress")}
              className={`px-3 py-1 font-semibold uppercase tracking-wider transition-all ${
                filterStatus === "in-progress"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200"
              }`}
            >
              Đang học
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1 font-semibold uppercase tracking-wider transition-all ${
                filterStatus === "completed"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200"
              }`}
            >
              Đã xong
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-stone-300 bg-[#F5F2EB] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Dạng lưới Index"
              className={`p-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="Dạng mục lục Syllabus"
              className={`p-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlists Container */}
      <div ref={containerRef}>
        {filteredPlaylists.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-300 shadow-[3px_3px_0px_#e7e5e4]">
            <p className="font-serif font-bold text-base text-stone-800">Không tìm thấy giáo trình phù hợp</p>
            <p className="text-xs text-stone-500 mt-1 font-mono">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlaylists.map((playlist, idx) => (
              <div key={playlist.id} className="playlist-item">
                <PlaylistCard playlist={playlist} index={idx} />
              </div>
            ))}
          </div>
        ) : (
          /* List / Syllabus View */
          <div className="space-y-3">
            {filteredPlaylists.map((playlist, idx) => {
              const isAllCompleted =
                playlist.videoCount > 0 && playlist.completedCount === playlist.videoCount;
              const volNumber = String(idx + 1).padStart(2, "0");

              return (
                <div
                  key={playlist.id}
                  className="playlist-item bg-white border border-stone-300 shadow-[2px_2px_0px_#d6d3d1] hover:border-stone-900 hover:shadow-[4px_4px_0px_#1c1917] transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-mono font-bold text-xs px-2 py-1 bg-stone-900 text-white shrink-0">
                      VOL. {volNumber}
                    </span>
                    <div className="space-y-1">
                      <Link
                        href={`/playlist/${playlist.id}`}
                        className="font-serif font-bold text-base text-stone-900 hover:text-blue-900 hover:underline transition-colors block"
                      >
                        {playlist.title}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-stone-500 font-sans">
                        {playlist.channelTitle && (
                          <span>Kênh Ytb: <strong className="text-stone-700">{playlist.channelTitle}</strong></span>
                        )}
                        <span>•</span>
                        <span className="font-mono">{playlist.videoCount} bài giảng</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:self-center">
                    <div className="text-right space-y-1 font-mono">
                      <div className="text-xs font-bold text-stone-800">
                        {playlist.completedCount}/{playlist.videoCount} ({playlist.completionPercentage}%)
                      </div>
                      <div className="w-28 bg-stone-200 h-1.5 border border-stone-300 overflow-hidden">
                        <div
                          className="h-full bg-stone-800"
                          style={{ width: `${playlist.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/playlist/${playlist.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white text-xs font-mono font-semibold hover:bg-stone-800 transition-colors"
                    >
                      <span>Vào học</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
