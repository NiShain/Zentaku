import type {
  AudioCategory,
  EpisodeServers,
  StreamingServer,
} from '../../infrastructure/external/aniwatch/aniwatch.types';

// Re-export for convenience
export type { AudioCategory, StreamingServer };

export interface GetEpisodeSourcesParams {
  anilistId: number;
  episodeNumber: number;
  refresh?: boolean;
  async?: boolean;
  server?: StreamingServer;
  category?: AudioCategory;
}

export interface EpisodeSourcesData {
  streamLinks: string[];
  subtitles: SubtitleTrack[];
  capturedAt: string;
  upstreamEpisodeId: string;
  meta: {
    refreshed: boolean;
    source: string;
  };
}

export interface SubtitleTrack {
  url: string;
  lang: string;
}

export interface EpisodeSourcesTaskMeta {
  taskId: string;
  status: string;
}

export interface EpisodeSourcesResponse {
  anilistId: number;
  episodeNumber: number;
  hianimeId: string;
  status: 'success' | 'pending';
  data?: EpisodeSourcesData;
  task?: EpisodeSourcesTaskMeta;
}

export interface SyncHianimeIdResponse {
  anilistId: number;
  hianimeId: string;
  wasSynced: boolean;
  source: 'database' | 'malsync';
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AvailableEpisodesResponse {
  anilistId: number;
  hianimeId: string;
  totalEpisodes: number;
  episodes: EpisodeInfo[];
  pagination?: PaginationMeta;
}

export interface EpisodeInfo {
  number: number;
  title: string;
  episodeId: string;
  order?: number;
  episodeUrl?: string;
  isFiller?: boolean;
}

export interface EpisodeServersResponse extends EpisodeServers {
  anilistId: number;
  episodeNumber: number;
  hianimeId: string;
}

export interface StreamingTaskStatusResponse {
  taskId: string;
  status: string;
  result?: EpisodeSourcesData;
  error?: string;
}

export enum StreamingErrorCode {
  ANIME_NOT_FOUND = 'ANIME_NOT_FOUND',
  HIANIME_ID_NOT_FOUND = 'HIANIME_ID_NOT_FOUND',
  MALSYNC_API_ERROR = 'MALSYNC_API_ERROR',
  ANIWATCH_API_ERROR = 'ANIWATCH_API_ERROR',
  EPISODE_NOT_AVAILABLE = 'EPISODE_NOT_AVAILABLE',
}
