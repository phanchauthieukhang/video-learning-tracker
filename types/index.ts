export interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface PlaylistSummary {
  id: string;
  userId: string;
  youtubePlaylistId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  channelTitle?: string | null;
  videoCount: number;
  importedAt: Date;
  updatedAt: Date;
  completedCount: number;
  completionPercentage: number;
}

export interface VideoItemData {
  id: string;
  playlistId: string;
  youtubeVideoId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  channelTitle?: string | null;
  position: number;
  durationSeconds?: number | null;
  publishedAt?: Date | null;
  createdAt: Date;
  isCompleted: boolean;
  notes?: string | null;
  notesUpdatedAt?: Date | null;
}

export interface PlaylistWithVideosData {
  id: string;
  userId: string;
  youtubePlaylistId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  channelTitle?: string | null;
  videoCount: number;
  importedAt: Date;
  updatedAt: Date;
  videos: VideoItemData[];
}

export interface YouTubePlaylistItemResponse {
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
    position?: number;
    resourceId?: {
      videoId?: string;
    };
    publishedAt?: string;
  };
}

export interface YouTubePlaylistSnippetResponse {
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
  itemCount?: number;
}

export interface YouTubePlaylistInfo {
  youtubePlaylistId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  channelTitle?: string | null;
  videoCount: number;
}

export interface YouTubeVideoInfo {
  youtubeVideoId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  channelTitle?: string | null;
  position: number;
  durationSeconds?: number | null;
  publishedAt?: Date | null;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";
