import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPlaylists } from "@/actions/playlist.actions";
import { NavigationHeader } from "@/components/navigation-header";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { PlaylistGrid } from "@/components/dashboard/playlist-grid";
import { EmptyState } from "@/components/dashboard/empty-state";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const playlists = await getUserPlaylists();

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

      <main className="flex-1 container max-w-7xl px-4 sm:px-8 py-8 mx-auto space-y-8">
        <DashboardHero playlists={playlists} userName={session.user.name} />

        {playlists.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2">
              <h2 className="font-serif text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <span>Danh Mục Giáo Trình Học Tập</span>
                <span className="text-xs px-2 py-0.5 bg-stone-900 text-white font-mono rounded-none">
                  {playlists.length} KHÓA HỌC
                </span>
              </h2>
              <span className="hidden sm:inline-block text-[11px] font-mono text-stone-500 uppercase tracking-widest">
                ACADEMIC ARCHIVE INDEX
              </span>
            </div>

            <PlaylistGrid playlists={playlists} />
          </div>
        )}
      </main>
    </div>
  );
}
