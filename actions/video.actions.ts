"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PlaylistWithVideosData } from "@/types";

export async function getPlaylistWithVideos(playlistDbId: string): Promise<PlaylistWithVideosData | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;

    // Execute query with automatic retry in case Neon serverless Postgres was sleeping
    let playlist = null;
    try {
      playlist = await prisma.playlist.findFirst({
        where: {
          id: playlistDbId,
          userId,
        },
        include: {
          videos: {
            orderBy: {
              position: "asc",
            },
            include: {
              userStates: {
                where: {
                  userId,
                },
              },
            },
          },
        },
      });
    } catch (dbErr) {
      console.warn("Retrying database query after initial cold start delay...", dbErr);
      await new Promise((resolve) => setTimeout(resolve, 800));
      playlist = await prisma.playlist.findFirst({
        where: {
          id: playlistDbId,
          userId,
        },
        include: {
          videos: {
            orderBy: {
              position: "asc",
            },
            include: {
              userStates: {
                where: {
                  userId,
                },
              },
            },
          },
        },
      });
    }

    if (!playlist) {
      return null;
    }

    return {
      id: playlist.id,
      userId: playlist.userId,
      youtubePlaylistId: playlist.youtubePlaylistId,
      title: playlist.title,
      description: playlist.description,
      thumbnailUrl: playlist.thumbnailUrl,
      channelTitle: playlist.channelTitle,
      videoCount: playlist.videoCount,
      importedAt: playlist.importedAt,
      updatedAt: playlist.updatedAt,
      videos: playlist.videos.map((v) => {
        const state = v.userStates[0];
        return {
          id: v.id,
          playlistId: v.playlistId,
          youtubeVideoId: v.youtubeVideoId,
          title: v.title,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          channelTitle: v.channelTitle,
          position: v.position,
          durationSeconds: v.durationSeconds,
          publishedAt: v.publishedAt,
          createdAt: v.createdAt,
          isCompleted: state?.isCompleted ?? false,
          notes: state?.notes ?? "",
          notesUpdatedAt: state?.updatedAt ?? null,
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching playlist with videos:", error);
    return null;
  }
}
