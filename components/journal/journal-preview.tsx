"use client";

import { useEffect, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { Copy, Check, Terminal } from "lucide-react";

interface JournalPreviewProps {
  content: string;
}

export function JournalPreview({ content }: JournalPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert plain text to markdown HTML
  const rawHtml = DOMPurify.sanitize(
    marked.parse(content || "*Chưa có ghi chú nào cho bài học này. Hãy chuyển sang tab 'Soạn thảo' để bắt đầu ghi chép.*", {
      gfm: true,
      breaks: true,
    }) as string
  );

  // Transform timestamps in HTML into interactive clickable buttons
  // Regex matches [MM:SS], [HH:MM:SS], @MM:SS, or MM:SS
  const transformedHtml = rawHtml.replace(
    /\[?(\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b)\]?/g,
    (match, timeStr) => {
      const parts = timeStr.split(":").map(Number);
      let totalSeconds = 0;
      if (parts.length === 3) {
        totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        totalSeconds = parts[0] * 60 + parts[1];
      }
      return `<button type="button" class="timestamp-link" data-seek-seconds="${totalSeconds}">⏱️ ${timeStr}</button>`;
    }
  );

  // Add click listeners to timestamps and code copy buttons
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Timestamp click handler
    const handleTimestampClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(".timestamp-link");
      if (!target) return;
      const seconds = Number(target.getAttribute("data-seek-seconds"));
      if (!isNaN(seconds)) {
        window.dispatchEvent(
          new CustomEvent("yt-seek-to", { detail: { seconds } })
        );
      }
    };

    container.addEventListener("click", handleTimestampClick);

    // 2. Enhance code blocks with Mac Terminal Header and Copy Button
    const preBlocks = container.querySelectorAll("pre");
    preBlocks.forEach((pre) => {
      if (pre.querySelector(".code-terminal-header")) return;

      const codeEl = pre.querySelector("code");
      const codeText = codeEl?.textContent || "";

      // Terminal Header
      const header = document.createElement("div");
      header.className =
        "code-terminal-header flex items-center justify-between px-3 py-1.5 bg-stone-900 border-b border-stone-800 text-stone-300 text-[11px] font-mono select-none -mt-4 -mx-4 mb-3";

      header.innerHTML = `
        <div class="flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full bg-red-500/80 inline-block"></span>
          <span class="h-2 w-2 rounded-full bg-amber-500/80 inline-block"></span>
          <span class="h-2 w-2 rounded-full bg-emerald-500/80 inline-block"></span>
          <span class="ml-2 text-stone-400 font-bold uppercase tracking-wider text-[10px]">TERMINAL // CODE SNIPPET</span>
        </div>
        <button type="button" class="code-copy-btn inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors">
          <svg class="h-3 w-3 copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span class="copy-text">Sao chép</span>
        </button>
      `;

      pre.prepend(header);

      const copyBtn = header.querySelector(".code-copy-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(codeText);
            const copyText = copyBtn.querySelector(".copy-text");
            if (copyText) copyText.textContent = "Đã chép ✓";
            copyBtn.classList.add("text-emerald-400");
            setTimeout(() => {
              if (copyText) copyText.textContent = "Sao chép";
              copyBtn.classList.remove("text-emerald-400");
            }, 2000);
          } catch {}
        });
      }
    });

    return () => {
      container.removeEventListener("click", handleTimestampClick);
    };
  }, [transformedHtml]);

  return (
    <div
      ref={containerRef}
      className="prose max-w-none p-5 bg-white border border-stone-200 shadow-[2px_2px_0px_rgba(28,25,23,0.06)] min-h-[300px]"
      dangerouslySetInnerHTML={{ __html: transformedHtml }}
    />
  );
}
