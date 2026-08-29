import { YOUTUBE_API_BASE } from "./constants";
import type { YouTubePlaylistInfo, YouTubeVideoInfo } from "@/types";

/**
 * Parses an ISO 8601 duration string (e.g., PT1H30M45S, PT5M20S, PT45S) to total seconds.
 */
export function iso8601DurationToSeconds(duration?: string | null): number {
  if (!duration || typeof duration !== "string") return 0;

  const regex = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const days = parseInt(matches[1] || "0", 10);
  const hours = parseInt(matches[2] || "0", 10);
  const minutes = parseInt(matches[3] || "0", 10);
  const seconds = parseInt(matches[4] || "0", 10);

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetches playlist metadata (title, description, thumbnail, channelTitle, videoCount)
 */
export async function fetchPlaylistInfo(playlistId: string): Promise<YouTubePlaylistInfo> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is not configured");
  }

  const url = `${YOUTUBE_API_BASE}/playlists?part=snippet,contentDetails&id=${encodeURIComponent(
    playlistId
  )}&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch YouTube playlist info: ${res.status} ${errorText}`);
  }

  const data: {
    items?: Array<{
      snippet?: {
        title?: string;
        description?: string;
        thumbnails?: {
          maxres?: { url?: string };
          standard?: { url?: string };
          high?: { url?: string };
          medium?: { url?: string };
          default?: { url?: string };
        };
        channelTitle?: string;
      };
      contentDetails?: {
        itemCount?: number;
      };
    }>;
  } = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Playlist not found or is private/inaccessible");
  }

  const item = data.items[0];
  const snippet = item.snippet || {};
  const thumbnails = snippet.thumbnails || {};
  const thumbnail =
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    null;

  return {
    youtubePlaylistId: playlistId,
    title: snippet.title || "Untitled Playlist",
    description: snippet.description || null,
    thumbnailUrl: thumbnail,
    channelTitle: snippet.channelTitle || null,
    videoCount: item.contentDetails?.itemCount || 0,
  };
}

/**
 * Fetches all videos in a playlist with pagination and enriches their durations.
 */
export async function fetchPlaylistVideos(playlistId: string): Promise<YouTubeVideoInfo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is not configured");
  }

  const rawVideos: Array<{
    youtubeVideoId: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    channelTitle: string | null;
    position: number;
    publishedAt: Date | null;
  }> = [];

  let nextPageToken: string | undefined = undefined;
  let currentPosition = 0;
  let keepFetching = true;

  while (keepFetching) {
    const pageParam: string = nextPageToken ? `&pageToken=${encodeURIComponent(nextPageToken)}` : "";
    const fetchUrl: string = `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(
      playlistId
    )}&maxResults=50${pageParam}&key=${apiKey}`;

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch YouTube playlist items: ${response.status} ${errorText}`);
    }

    const payload: {
      nextPageToken?: string;
      items?: Array<{
        snippet?: {
          title?: string;
          description?: string;
          thumbnails?: {
            maxres?: { url?: string };
            standard?: { url?: string };
            high?: { url?: string };
            medium?: { url?: string };
            default?: { url?: string };
          };
          channelTitle?: string;
          videoOwnerChannelTitle?: string;
          position?: number;
          publishedAt?: string;
          resourceId?: {
            videoId?: string;
          };
        };
        contentDetails?: {
          videoId?: string;
        };
      }>;
    } = await response.json();

    const items = payload.items || [];

    for (const item of items) {
      const snippet = item.snippet || {};
      const videoId = snippet.resourceId?.videoId || item.contentDetails?.videoId;

      // Skip private or deleted videos
      if (!videoId || snippet.title === "Private video" || snippet.title === "Deleted video") {
        continue;
      }

      const thumbnails = snippet.thumbnails || {};
      const thumbnail =
        thumbnails.maxres?.url ||
        thumbnails.standard?.url ||
        thumbnails.high?.url ||
        thumbnails.medium?.url ||
        thumbnails.default?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      rawVideos.push({
        youtubeVideoId: videoId,
        title: snippet.title || "Untitled Video",
        description: snippet.description || null,
        thumbnailUrl: thumbnail,
        channelTitle: snippet.videoOwnerChannelTitle || snippet.channelTitle || null,
        position: currentPosition++,
        publishedAt: snippet.publishedAt ? new Date(snippet.publishedAt) : null,
      });
    }

    nextPageToken = payload.nextPageToken;
    if (!nextPageToken) {
      keepFetching = false;
    }
  }

  // Batch fetch durations for all videos in chunks of 50
  const videoIds = rawVideos.map((v) => v.youtubeVideoId);
  const durationMap = new Map<string, number>();

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const chunkIds = chunk.join(",");
    try {
      const videoRes = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${encodeURIComponent(
          chunkIds
        )}&key=${apiKey}`
      );
      if (videoRes.ok) {
        const videoData: {
          items?: Array<{
            id: string;
            contentDetails?: {
              duration?: string;
            };
          }>;
        } = await videoRes.json();
        for (const item of videoData.items || []) {
          const durationStr = item.contentDetails?.duration;
          if (durationStr) {
            durationMap.set(item.id, iso8601DurationToSeconds(durationStr));
          }
        }
      }
    } catch {
      // If duration lookup fails for a batch, ignore and continue without durations
    }
  }

  return rawVideos.map((v) => ({
    ...v,
    durationSeconds: durationMap.get(v.youtubeVideoId) ?? null,
  }));
}
