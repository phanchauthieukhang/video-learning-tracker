"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Library } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { UserMenu } from "@/components/auth/user-menu";
import type { UserSession } from "@/types";

interface NavigationHeaderProps {
  user: UserSession;
}

export function NavigationHeader({ user }: NavigationHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const logoIconRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    },
    { scope: headerRef }
  );

  const handleLogoHover = () => {
    if (!logoIconRef.current) return;
    gsap.to(logoIconRef.current, {
      scale: 1.1,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleLogoLeave = () => {
    if (!logoIconRef.current) return;
    gsap.to(logoIconRef.current, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b-2 border-stone-800 bg-[#FAF8F5]/95 backdrop-blur-md"
    >
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 mx-auto">
        <Link
          href="/dashboard"
          onMouseEnter={handleLogoHover}
          onMouseLeave={handleLogoLeave}
          className="flex items-center gap-3 group"
        >
          <div
            ref={logoIconRef}
            className="flex h-9 w-9 items-center justify-center bg-stone-900 text-white rounded-none border border-stone-900 shadow-[2px_2px_0px_#78716c]"
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black text-lg text-stone-900 tracking-tight leading-none group-hover:text-blue-900 transition-colors">
              ACADEMIA LOG
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-stone-500 font-bold mt-0.5">
              VIDEO STUDY &amp; RESEARCH DESK
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">

          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
