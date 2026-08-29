"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { saveNotes } from "@/actions/user-video-state.actions";
import { DEBOUNCE_MS, MAX_NOTES_LENGTH } from "@/lib/constants";
import { SaveIndicator } from "./save-indicator";
import { JournalPreview } from "./journal-preview";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit3,
  Eye,
  BookOpen,
  Bold,
  Italic,
  Code,
  List,
  Quote,
  Heading2,
  CheckSquare,
  Clock,
  HelpCircle,
  FileText
} from "lucide-react";
import type { SaveStatus } from "@/types";

interface JournalEditorProps {
  videoId: string;
  initialNotes?: string | null;
  dbUpdatedAt?: Date | string | null;
}

export function JournalEditor({
  videoId,
  initialNotes,
  dbUpdatedAt,
}: JournalEditorProps) {
  const lsKey = `notes_${videoId}`;

  const getInitialContent = useCallback(() => {
    if (typeof window === "undefined") return initialNotes ?? "";
    try {
      const stored = localStorage.getItem(lsKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.content !== undefined) {
          if (!dbUpdatedAt) return parsed.content;
          const lsTime = new Date(parsed.savedAt).getTime();
          const dbTime = new Date(dbUpdatedAt).getTime();
          if (lsTime > dbTime) {
            return parsed.content;
          }
        }
      }
    } catch {}
    return initialNotes ?? "";
  }, [lsKey, initialNotes, dbUpdatedAt]);

  const [content, setContent] = useState<string>("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const contentRef = useRef<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef<boolean>(false);
  const videoIdRef = useRef<string>(videoId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    videoIdRef.current = videoId;
    const initial = getInitialContent();
    setContent(initial);
    contentRef.current = initial;
    isDirtyRef.current = false;
    setStatus("idle");
  }, [videoId, getInitialContent]);

  const performSave = useCallback(
    async (textToSave: string, targetVideoId: string) => {
      if (!isDirtyRef.current) return;

      try {
        setStatus("saving");
        const res = await saveNotes(targetVideoId, textToSave);
        if (res.success) {
          setStatus("saved");
          isDirtyRef.current = false;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                `notes_${targetVideoId}`,
                JSON.stringify({
                  content: textToSave,
                  savedAt: res.updatedAt || new Date().toISOString(),
                })
              );
            } catch {}
          }
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Save notes error:", err);
        setStatus("error");
      }
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length > MAX_NOTES_LENGTH) return;

    setContent(newContent);
    contentRef.current = newContent;
    isDirtyRef.current = true;
    setStatus("idle");

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          lsKey,
          JSON.stringify({
            content: newContent,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {}
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave(newContent, videoId);
    }, DEBOUNCE_MS);
  };

  const handleBlur = () => {
    if (isDirtyRef.current) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      performSave(contentRef.current, videoId);
    }
  };

  useEffect(() => {
    const currentVideoId = videoId;
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (isDirtyRef.current && contentRef.current) {
        saveNotes(currentVideoId, contentRef.current).catch(() => {});
      }
    };
  }, [videoId]);

  // Helper function to insert formatting snippets
  const insertSnippet = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = content;
    const selected = previous.substring(start, end) || "nội dung";
    const replacement = `${prefix}${selected}${suffix}`;
    const nextContent = previous.substring(0, start) + replacement + previous.substring(end);

    setContent(nextContent);
    contentRef.current = nextContent;
    isDirtyRef.current = true;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // Insert Live Video Timestamp at cursor
  const handleInsertCurrentTimestamp = () => {
    let seconds = 0;
    if (typeof window !== "undefined" && window.__ytPlayerInstance && typeof window.__ytPlayerInstance.getCurrentTime === "function") {
      seconds = Math.floor(window.__ytPlayerInstance.getCurrentTime());
    }

    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const timeFormatted = `[${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}]`;

    insertSnippet(`\n⏱️ ${timeFormatted} - `, "\n");
  };

  return (
    <div className="flex flex-col h-full bg-white border-2 border-stone-800 shadow-[4px_4px_0px_rgba(28,25,23,0.12)]">
      {/* Editor Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-[#F5F2EB] border-b-2 border-stone-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-stone-900 text-white rounded-none">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <span>Sổ Tay Nghiên Cứu & Nhật Ký</span>
            </h3>
            <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase">
              DOCUMENTATION / SCHOLAR NOTEBOOK
            </span>
          </div>
        </div>

        {/* Tab & Save Indicator */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <SaveIndicator status={status} />

          <div className="flex items-center border border-stone-800 bg-white p-0.5 text-xs shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                activeTab === "edit"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-950 hover:bg-stone-100"
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span>Ghi chép</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                activeTab === "preview"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-950 hover:bg-stone-100"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Đọc lại (Interactive)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Formatting Toolbar (In Edit mode) */}
      {activeTab === "edit" && (
        <div className="flex flex-wrap items-center gap-1 px-4 py-2 bg-stone-100/75 border-b border-stone-200">
          <button
            type="button"
            onClick={handleInsertCurrentTimestamp}
            title="Chèn Timestamp thời gian video hiện tại (Ví dụ: [04:20])"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-none bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-600 hover:text-white transition-colors shadow-xs"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>+ Gắn Timestamp</span>
          </button>

          <div className="h-4 w-px bg-stone-300 mx-1" />

          <button
            type="button"
            onClick={() => insertSnippet("### ", "")}
            title="Tiêu đề H3"
            className="px-2 py-1 text-xs font-bold text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition-colors"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("**", "**")}
            title="In đậm"
            className="p-1 text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition-colors"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("*", "*")}
            title="In nghiêng"
            className="p-1 text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition-colors"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("`", "`")}
            title="Đoạn mã (Inline code)"
            className="p-1 text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition-colors"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("\n```typescript\n", "\n```\n")}
            title="Khối mã (Code Block)"
            className="px-2 py-1 text-xs font-mono font-semibold text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition-colors"
          >
            &lt;/&gt; Code Block
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("\n- ", "")}
            title="Danh sách gạch đầu dòng"
            className="p-1 text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition-colors"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("\n- [ ] ", "")}
            title="Checklist nhiệm vụ"
            className="p-1 text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition-colors"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("\n> ", "")}
            title="Trích dẫn"
            className="p-1 text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition-colors"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body / Preview Body */}
      <div className="flex-1 min-h-[300px]">
        {activeTab === "edit" ? (
          <div className="flex flex-col h-full">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="✍️ Ghi chép luận điểm chính, công thức, đoạn mã quan trọng... Bấm nút '+ Gắn Timestamp' để đánh dấu vị trí video đang xem!"
              className="flex-1 min-h-[300px] font-mono text-sm leading-relaxed p-5 resize-y bg-white text-stone-900 border-none rounded-none focus-visible:ring-0 placeholder:text-stone-400"
            />
            <div className="flex justify-between items-center text-[11px] font-mono bg-[#FBF9F4] px-4 py-2 border-t border-stone-200 text-stone-500">
              <span className="flex items-center gap-1.5 text-stone-600">
                <span>💡 Mẹo: Nhập dạng [MM:SS] (VD: [03:45]) ở tab đọc lại để bấm tua video tức thì</span>
              </span>
              <span className="font-semibold text-stone-800">
                {content.length} / {MAX_NOTES_LENGTH} ký tự
              </span>
            </div>
          </div>
        ) : (
          <JournalPreview content={content} />
        )}
      </div>
    </div>
  );
}
