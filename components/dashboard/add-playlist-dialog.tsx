"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPlaylist } from "@/actions/playlist.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, AlertCircle, BookPlus, Youtube } from "lucide-react";

export function AddPlaylistDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Vui lòng nhập đường dẫn hoặc ID playlist.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await addPlaylist(url);
      if (res.success && res.playlistId) {
        setUrl("");
        setOpen(false);
        router.push(`/playlist/${res.playlistId}`);
        router.refresh();
      } else {
        setError(res.error || "Không thể thêm playlist. Vui lòng kiểm tra lại URL.");
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setError(null);
          setUrl("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-none bg-stone-900 hover:bg-stone-800 text-white font-mono uppercase font-bold text-xs tracking-wider border-2 border-stone-900 shadow-[3px_3px_0px_#78716c] hover:shadow-[1px_1px_0px_#78716c] hover:translate-x-[1px] hover:translate-y-[1px] transition-all px-4 py-2.5">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nhập Giáo Trình Mới</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-lg border-2 border-stone-800 rounded-none shadow-[8px_8px_0px_#1c1917] p-6">
        <DialogHeader className="space-y-2 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-red-800 text-white rounded-none">
              <Youtube className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-stone-500 uppercase">
              IMPORT REPOSITORY // PLAYLIST REEL
            </span>
          </div>
          <DialogTitle className="font-serif text-xl font-bold text-stone-900">
            Nhập Danh Sách Phát YouTube
          </DialogTitle>
          <DialogDescription className="text-stone-600 text-xs font-sans">
            Dán đường dẫn danh sách phát YouTube (URL) hoặc ID playlist để hệ thống tự động biên soạn danh mục bài giảng vào bàn học của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-800 block">
              Đường dẫn YouTube Playlist:
            </label>
            <Input
              placeholder="https://www.youtube.com/playlist?list=PL..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              disabled={isPending}
              className="w-full bg-[#FAF8F5] border-2 border-stone-400 text-stone-900 placeholder:text-stone-400 rounded-none focus-visible:ring-0 focus-visible:border-stone-900 p-3 text-xs font-mono"
            />
            {error && (
              <div className="flex items-center gap-1.5 p-2.5 bg-red-50 border border-red-300 text-xs font-mono text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 gap-2 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-none border border-stone-300 text-stone-700 font-mono text-xs uppercase"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !url.trim()}
              className="rounded-none bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs uppercase font-bold px-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Đang khởi tạo mục lục...</span>
                </>
              ) : (
                "Xác Nhận Nhập Khóa Học"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
