import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getPlaylistWithVideos } from "@/actions/video.actions";
import { NavigationHeader } from "@/components/navigation-header";
import { YouTubePlayer } from "@/components/player/youtube-player";
import { VideoList } from "@/components/player/video-list";
import { JournalEditor } from "@/components/journal/journal-editor";
import { CompletionToggle } from "@/components/player/completion-toggle";
import { ChevronLeft, BookOpen, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

interface PlaylistPageProps {
  params: {
    playlistId: string;
  };
  searchParams: {
    videoId?: string;
  };
}

export default async function PlaylistPage({
  params,
  searchParams,
}: PlaylistPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const playlist = await getPlaylistWithVideos(params.playlistId);
  if (!playlist || playlist.videos.length === 0) {
    notFound();
  }

  // Active video is either specified in URL searchParam or first video by default
  const activeVideo =
    playlist.videos.find((v) => v.youtubeVideoId === searchParams.videoId) ||
    playlist.videos[0];

  const lessonIndex = String(activeVideo.position + 1).padStart(2, "0");

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <NavigationHeader
        user={{
          id: session.user.id ?? "",
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />

      <div className="flex-1 container max-w-7xl px-4 sm:px-6 py-6 mx-auto flex flex-col space-y-5">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between border-b border-stone-300 pb-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-800 text-xs font-mono font-bold uppercase tracking-wider text-stone-900 shadow-[2px_2px_0px_#1c1917] hover:bg-stone-100 transition-all group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>&larr; Quay Lại Tổng Quan</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 font-serif text-xs text-stone-600">
            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-stone-200 text-stone-800 uppercase font-bold">GIÁO TRÌNH</span>
            <span className="font-bold text-stone-900 truncate max-w-md">{playlist.title}</span>
          </div>
        </div>

        {/* Main Content Grid: Player + Journal on Left, Video List Sidebar on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Embedded YouTube Player with Seek Listener */}
            <YouTubePlayer videoId={activeVideo.youtubeVideoId} />

            {/* Video Details & Completion Toggle Header */}
            <div className="bg-white border-2 border-stone-800 p-5 shadow-[4px_4px_0px_#1c1917] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-900 text-white">
                    BÀI #{lessonIndex}
                  </span>
                  <h1 className="font-serif text-lg sm:text-xl font-bold text-stone-900 line-clamp-2">
                    {activeVideo.title}
                  </h1>
                </div>
                {activeVideo.channelTitle && (
                  <p className="text-xs text-stone-500 font-sans">
                    Giảng viên: <span className="font-semibold text-stone-800">{activeVideo.channelTitle}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 bg-[#F5F2EB] px-3.5 py-2 border border-stone-800 shadow-sm">
                <CompletionToggle
                  videoId={activeVideo.id}
                  initialCompleted={activeVideo.isCompleted}
                />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900">
                  {activeVideo.isCompleted ? "ĐÃ HOÀN TẤT" : "ĐÁNH DẤU HOÀN THÀNH"}
                </span>
              </div>
            </div>

            {/* Markdown Learning Journal with Live Seek Integration */}
            <JournalEditor
              videoId={activeVideo.id}
              initialNotes={activeVideo.notes}
              dbUpdatedAt={activeVideo.notesUpdatedAt}
            />
          </div>

          {/* Sidebar Column: Video Playlist Items (4 cols) */}
          <div className="lg:col-span-4 h-[750px] lg:sticky lg:top-24">
            <VideoList
              videos={playlist.videos}
              currentVideoId={activeVideo.youtubeVideoId}
              playlistDbId={playlist.id}
              playlistTitle={playlist.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
