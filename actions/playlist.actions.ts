"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractPlaylistId } from "@/lib/utils";
import { fetchPlaylistInfo, fetchPlaylistVideos } from "@/lib/youtube";
import { revalidatePath } from "next/cache";
import type { PlaylistSummary } from "@/types";

export async function addPlaylist(urlOrId: string): Promise<{ success: boolean; playlistId?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    const userId = session.user.id;

    const playlistId = extractPlaylistId(urlOrId);
    if (!playlistId) {
      return { success: false, error: "Đường dẫn hoặc ID playlist YouTube không hợp lệ." };
    }

    // Check if playlist already exists for this user
    const existing = await prisma.playlist.findFirst({
      where: {
        userId,
        youtubePlaylistId: playlistId,
      },
    });

    if (existing) {
      return { success: false, error: "Playlist này đã được thêm vào tài khoản của bạn trước đó." };
    }

    // Fetch playlist metadata from YouTube Data API
    const playlistInfo = await fetchPlaylistInfo(playlistId);

    // Fetch all videos from YouTube Data API
    const videos = await fetchPlaylistVideos(playlistId);

    if (videos.length === 0) {
      return { success: false, error: "Playlist không chứa video nào hoặc toàn bộ video ở chế độ riêng tư." };
    }

    // Save to Database in a transaction
    const createdPlaylist = await prisma.$transaction(async (tx) => {
      const newPlaylist = await tx.playlist.create({
        data: {
          userId,
          youtubePlaylistId: playlistInfo.youtubePlaylistId,
          title: playlistInfo.title,
          description: playlistInfo.description,
          thumbnailUrl: playlistInfo.thumbnailUrl,
          channelTitle: playlistInfo.channelTitle,
          videoCount: videos.length,
        },
      });

      await tx.video.createMany({
        data: videos.map((v) => ({
          playlistId: newPlaylist.id,
          youtubeVideoId: v.youtubeVideoId,
          title: v.title,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          channelTitle: v.channelTitle,
          position: v.position,
          durationSeconds: v.durationSeconds,
          publishedAt: v.publishedAt,
        })),
      });

      return newPlaylist;
    });

    revalidatePath("/dashboard");
    return { success: true, playlistId: createdPlaylist.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi khi thêm playlist.";
    return { success: false, error: message };
  }
}

export async function getUserPlaylists(): Promise<PlaylistSummary[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const userId = session.user.id;

  const playlists = await prisma.playlist.findMany({
    where: { userId },
    orderBy: { importedAt: "desc" },
    include: {
      videos: {
        select: {
          id: true,
          userStates: {
            where: { userId },
            select: { isCompleted: true },
          },
        },
      },
    },
  });

  return playlists.map((p) => {
    const totalVideos = p.videos.length;
    const completedCount = p.videos.filter((v) => v.userStates[0]?.isCompleted).length;
    const completionPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

    return {
      id: p.id,
      userId: p.userId,
      youtubePlaylistId: p.youtubePlaylistId,
      title: p.title,
      description: p.description,
      thumbnailUrl: p.thumbnailUrl,
      channelTitle: p.channelTitle,
      videoCount: totalVideos,
      importedAt: p.importedAt,
      updatedAt: p.updatedAt,
      completedCount,
      completionPercentage,
    };
  });
}

export async function deletePlaylist(playlistDbId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await prisma.playlist.deleteMany({
      where: {
        id: playlistDbId,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return { success: false, error: "Playlist không tồn tại hoặc bạn không có quyền xóa." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi xóa playlist";
    return { success: false, error: message };
  }
}
