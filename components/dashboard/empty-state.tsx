import { BookPlus, Library } from "lucide-react";
import { AddPlaylistDialog } from "./add-playlist-dialog";

export function EmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center bg-white border-2 border-dashed border-stone-400 p-8 sm:p-12 text-center shadow-[4px_4px_0px_#e7e5e4]">
      <div className="flex h-16 w-16 items-center justify-center bg-stone-900 text-white rounded-none mb-5 border-2 border-stone-900 shadow-[3px_3px_0px_#78716c]">
        <Library className="h-8 w-8" />
      </div>

      <span className="font-mono text-xs uppercase font-bold tracking-widest px-3 py-1 bg-[#F5F2EB] border border-stone-300 text-stone-700 mb-3">
        BÀN HỌC ĐANG TRỐNG // INDEX ZERO
      </span>

      <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
        Chưa Có Giáo Trình Nào Được Thêm
      </h3>

      <p className="text-sm text-stone-600 max-w-md mb-8 font-sans leading-relaxed">
        Nhập danh sách phát YouTube đầu tiên của bạn để tạo mục lục bài giảng, bắt đầu xem bài học tập trung và ghi chép nhật ký nghiên cứu.
      </p>

      <AddPlaylistDialog />
    </div>
  );
}
