"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { LoginButton } from "@/components/auth/login-button";
import { BookOpen, CheckSquare, GraduationCap, Library, PlaySquare, ShieldCheck } from "lucide-react";

export function AnimatedLoginView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        ".academic-badge",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }
      )
        .fromTo(
          ".academic-title",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          cardRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          ".feature-row",
          { x: -15, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, stagger: 0.08 },
          "-=0.3"
        );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#FAF8F5]"
    >
      {/* Main Container */}
      <div className="w-full max-w-lg flex flex-col items-center z-10 space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="academic-badge inline-flex items-center gap-2 px-3 py-1 bg-[#EDE8DE] border border-stone-400 text-xs font-mono font-bold uppercase tracking-widest text-stone-800">
            <Library className="h-3.5 w-3.5" />
            <span>EST. 2026 // ACADEMIA RESEARCH DESK</span>
          </div>

          <h1 className="academic-title font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Không Gian Nghiên Cứu <br />
            <span className="italic font-serif text-blue-900 underline decoration-stone-400 underline-offset-8">
              Học Tập Qua Video
            </span>
          </h1>

          <p className="text-stone-600 text-sm max-w-md font-sans">
            Môi trường học tập kỷ luật, không quảng cáo, tích hợp sổ tay ghi chép Markdown và liên kết timestamp video tức thì.
          </p>
        </div>

        {/* Academic Card */}
        <div ref={cardRef} className="w-full">
          <div className="bg-white border-2 border-stone-800 shadow-[6px_6px_0px_#1c1917] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-3 font-mono text-xs uppercase font-bold text-stone-800">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span>NHẬP HỌC / AUTHENTICATION</span>
              </span>
              <span className="text-stone-500">GATEWAY #01</span>
            </div>

            <div className="space-y-3.5">
              <div className="feature-row flex items-start gap-3.5 p-3 bg-[#FAF8F5] border border-stone-200">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-stone-900 text-white rounded-none">
                  <PlaySquare className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">Nhúng Playlist YouTube Tập Trung</h4>
                  <p className="text-xs text-stone-600 font-sans mt-0.5">Xem video không quảng cáo gợi ý phân tâm.</p>
                </div>
              </div>

              <div className="feature-row flex items-start gap-3.5 p-3 bg-[#FAF8F5] border border-stone-200">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-blue-900 text-white rounded-none">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">Sổ Tay Markdown &amp; Timestamp Tua Video</h4>
                  <p className="text-xs text-stone-600 font-sans mt-0.5">Bấm vào mốc thời gian trong ghi chú để tua video ngay.</p>
                </div>
              </div>

              <div className="feature-row flex items-start gap-3.5 p-3 bg-[#FAF8F5] border border-stone-200">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-emerald-800 text-white rounded-none">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">Đánh Dấu &amp; Theo Dõi Tiến Trình</h4>
                  <p className="text-xs text-stone-600 font-sans mt-0.5">Ăn mừng pháo hoa Confetti khi hoàn tất bài giảng.</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-3">
              <LoginButton />
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-stone-700" />
                <span>Bảo mật dữ liệu cá nhân theo Google Account</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
