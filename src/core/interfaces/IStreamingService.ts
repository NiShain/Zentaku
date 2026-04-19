import type {
  AvailableEpisodesResponse,
  EpisodeSourcesResponse,
  StreamingTaskStatusResponse,
  SyncHianimeIdResponse,
} from '../types/streaming.types';

export interface IStreamingService {
  /**
   * Sync HiAnime ID for an anime
   *
   * @param anilistId - AniList anime ID
   * @returns Sync result with HiAnime ID
   */
  syncHianimeId(anilistId: number): Promise<SyncHianimeIdResponse>;

  /**
   * Get streaming sources for a specific episode
   */
  getEpisodeSources(
    anilistId: number,
    episodeNumber: number,
    refresh?: boolean,
    async?: boolean,
    requestId?: string
  ): Promise<EpisodeSourcesResponse>;

  /**
   * Get available episodes for an anime
   */
  getAvailableEpisodes(anilistId: number): Promise<AvailableEpisodesResponse>;

  /**
   * Get async task status from provider
   */
  getTaskStatus(taskId: string, requestId?: string): Promise<StreamingTaskStatusResponse>;
}
