export interface AniProviderErrorEnvelope {
  error: {
    code: string;
    message: string;
    request_id?: string;
    details?: Record<string, unknown>;
  };
}

export interface AniProviderEpisodeItem {
  episode_id: string;
  order: number;
  title: string;
  episode_url: string;
}

export interface AniProviderEpisodesResponse {
  anime_id: string;
  total: number;
  items: AniProviderEpisodeItem[];
  meta: {
    refreshed: boolean;
    source: 'mysql_cache' | 'live_crawl';
  };
}

export interface AniProviderSourcesSuccessResponse {
  episode_id: string;
  stream_links: string[];
  vtt_links: string[];
  captured_at: string;
  meta: {
    refreshed: boolean;
    source: 'mysql_cache' | 'rapidcloud_capture' | 'rapidcloud_capture_async';
  };
}

export interface AniProviderSourcesAcceptedResponse {
  episode_id: string;
  task_id: string;
  status: 'pending';
  meta: {
    refreshed: boolean;
    source: 'celery_queue';
  };
}

export interface AniProviderTaskResponse {
  task_id: string;
  status: string;
  result?: unknown;
  error?: string;
}

export interface AniProviderGetSourcesOptions {
  refresh?: boolean;
  async?: boolean;
  requestId?: string;
}

export interface AniProviderRequestOptions {
  refresh?: boolean;
  requestId?: string;
}

export type AniProviderSourcesResponse =
  | AniProviderSourcesSuccessResponse
  | AniProviderSourcesAcceptedResponse;
