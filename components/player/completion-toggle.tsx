"use client";

import { useOptimistic, useTransition, useRef } from "react";
import { toggleCompletion } from "@/actions/user-video-state.actions";
import { Check } from "lucide-react";
import confetti from "canvas-confetti";
import gsap from "gsap";

interface CompletionToggleProps {
  videoId: string;
  initialCompleted: boolean;
}

export function CompletionToggle({
  videoId,
  initialCompleted,
}: CompletionToggleProps) {
  const [optimisticCompleted, setOptimistic] = useOptimistic(initialCompleted);
  const [, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !optimisticCompleted;

    // Trigger Canvas Confetti Celebration on completion
    if (nextState) {
      // Trigger GSAP stamp bounce
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { scale: 0.7, rotate: -15 },
          { scale: 1.2, rotate: 0, duration: 0.3, ease: "back.out(3)", onComplete: () => {
            gsap.to(buttonRef.current, { scale: 1, duration: 0.15 });
          }}
        );
      }

      // Fire festive academic gold, emerald, and crimson confetti!
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { x, y },
        colors: ["#1e3a8a", "#b45309", "#047857", "#b91c1c", "#f59e0b"],
        ticks: 150,
        gravity: 1.1,
        scalar: 0.9,
      });
    }

    startTransition(async () => {
      setOptimistic(nextState);
      await toggleCompletion(videoId, nextState);
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={optimisticCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu đã hoàn thành bài học"}
      title={optimisticCompleted ? "Đã hoàn thành bài học (Bấm để hủy)" : "Bấm để đánh dấu hoàn thành"}
      className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-none border-2 transition-all duration-150 focus:outline-none ${
        optimisticCompleted
          ? "bg-emerald-700 border-emerald-900 text-white shadow-[2px_2px_0px_rgba(4,120,87,0.4)]"
          : "bg-white border-stone-800 text-transparent hover:bg-stone-100 hover:border-black"
      }`}
    >
      <Check
        className={`h-4 w-4 stroke-[3.5] transition-all duration-150 ${
          optimisticCompleted ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      />
    </button>
  );
}
