/**
 * Streaming Service
 *
 * Service layer for streaming operations.
 * Inherits from BaseService for validation, logging, and error handling.
 *
 * @extends BaseService
 */

import { BaseService } from '../../core/base/BaseService';
import type { IStreamingService } from '../../core/interfaces/IStreamingService';
import type {
  AudioCategory,
  AvailableEpisodesResponse,
  EpisodeInfo,
  EpisodeServersResponse,
  EpisodeSourcesData,
  EpisodeSourcesResponse,
  StreamingServer,
  StreamingTaskStatusResponse,
  SyncHianimeIdResponse,
} from '../../core/types/streaming.types';
import type AniProviderClient from '../../infrastructure/external/aniprovider/AniProviderClient';
import type {
  AniProviderEpisodesResponse,
  AniProviderSourcesSuccessResponse,
} from '../../infrastructure/external/aniprovider/aniprovider.types';
import type AniwatchClient from '../../infrastructure/external/aniwatch/AniwatchClient';
import type MalSyncClient from '../../infrastructure/external/malsync/MalSyncClient';
import { NotFoundError, ValidationError } from '../../shared/utils/error';
import type AnimeRepository from '../anime/anime.repository';
import type AnimeService from '../anime/anime.service';

class StreamingService extends BaseService implements IStreamingService {
  private readonly providerMode: 'aniwatch' | 'aniprovider';

  constructor(
    private readonly animeRepository: AnimeRepository,
    private readonly animeService: AnimeService,
    private readonly malSyncClient: MalSyncClient,
    private readonly aniwatchClient: AniwatchClient,
    private readonly aniProviderClient: AniProviderClient
  ) {
    super();
    this.providerMode =
      process.env.ANIPROVIDER_PROVIDER_MODE === 'aniwatch' ? 'aniwatch' : 'aniprovider';
    this.logger.info('[StreamingService] Initialized');
  }

  /**
   * Sync HiAnime ID for an anime using MALSync
   *
   * @param anilistId - AniList anime ID
   * @returns Sync result with HiAnime ID
   */
  async syncHianimeId(anilistId: number): Promise<SyncHianimeIdResponse> {
    const validId = this._validateId(anilistId, 'AniList ID');

    this.logger.info(`[StreamingService] Syncing HiAnime ID for AniList ID: ${validId}`);

    let anime = await this.animeRepository.findByAnilistId(validId);
    if (!anime) {
      this.logger.info(
        `[StreamingService] Anime ${validId} not found in DB, fetching from AniList...`
      );
      await this.animeService.getAnimeDetails(validId);
      anime = await this.animeRepository.findByAnilistId(validId);

      if (!anime) {
        throw new NotFoundError(
          `Anime with AniList ID ${validId} not found on AniList or failed to sync`
        );
      }
    }

    if (anime.idHianime) {
      this.logger.debug(`[StreamingService] HiAnime ID already exists: ${anime.idHianime}`);
      return {
        anilistId: validId,
        hianimeId: anime.idHianime,
        wasSynced: false,
        source: 'database',
      };
    }

    const hianimeId = await this.malSyncClient.getHianimeIdByAnilistId(validId);

    if (!hianimeId) {
      throw new NotFoundError(`Anime with AniList ID ${validId} not available on HiAnime`);
    }

    this.logger.info(`[StreamingService] HiAnime ID found: ${hianimeId}, validating...`);
    this._validateHianimeId(hianimeId);

    await this.animeRepository.updateHianimeId(validId, hianimeId);

    this.logger.info(`[StreamingService] HiAnime ID synced: ${hianimeId}`);

    return {
      anilistId: validId,
      hianimeId,
      wasSynced: true,
      source: 'malsync',
    };
  }

  /**
   * Get streaming sources for a specific episode
   *
   * @param anilistId - AniList anime ID
   * @param episodeNumber - Episode number
   * @param server - Streaming server (optional)
   * @param category - Audio category (optional)
   * @returns Episode sources with streaming links
   */
  async getEpisodeSources(
    anilistId: number,
    episodeNumber: number,
    refresh: boolean = false,
    asyncMode: boolean = false,
    server?: StreamingServer,
    category?: AudioCategory,
    requestId?: string
  ): Promise<EpisodeSourcesResponse> {
    const validAnilistId = this._validateId(anilistId, 'AniList ID');
    const validEpisodeNumber = this._validateId(episodeNumber, 'Episode Number');

    this.logger.info(`[StreamingService] Getting episode sources:`, {
      anilistId: validAnilistId,
      episodeNumber: validEpisodeNumber,
      refresh,
      asyncMode,
      requestId,
      server,
      category,
    });

    const hianimeId = await this._getOrSyncHianimeId(validAnilistId);

    if (this.providerMode === 'aniwatch') {
      const episodesData = await this.aniwatchClient.getAnimeEpisodes(hianimeId, 1, 10000);
      const episode = episodesData.episodes.find((ep) => ep.number === validEpisodeNumber);

      if (!episode) {
        throw new NotFoundError(
          `Episode ${validEpisodeNumber} not found for anime ${validAnilistId}`
        );
      }

      const sources = await this.aniwatchClient.getEpisodeSources(
        episode.episodeId,
        server,
        category
      );

      return {
        anilistId: validAnilistId,
        episodeNumber: validEpisodeNumber,
        hianimeId,
        status: 'success',
        data: {
          streamLinks: sources.sources.map((item) => item.url),
          subtitles: sources.subtitles.map((item) => ({ url: item.url, lang: item.lang })),
          capturedAt: new Date().toISOString(),
          upstreamEpisodeId: episode.episodeId,
          meta: {
            refreshed: refresh,
            source: 'aniwatch_proxy',
          },
        },
      };
    }

    const episodesData = await this.aniProviderClient.getEpisodes(hianimeId, {
      refresh,
      requestId,
    });
    const episode = this._findEpisodeByNumber(episodesData, validEpisodeNumber);

    if (!episode) {
      throw new NotFoundError(
        `Episode ${validEpisodeNumber} not found for anime ${validAnilistId}`
      );
    }

    const sources = await this.aniProviderClient.getSources(episode.episodeId, {
      refresh,
      async: asyncMode,
      requestId,
    });

    if ('task_id' in sources) {
      return {
        anilistId: validAnilistId,
        episodeNumber: validEpisodeNumber,
        hianimeId,
        status: 'pending',
        task: {
          taskId: sources.task_id,
          status: sources.status,
        },
      };
    }

    return {
      anilistId: validAnilistId,
      episodeNumber: validEpisodeNumber,
      hianimeId,
      status: 'success',
      data: this._mapSourcesSuccess(episode.episodeId, sources),
    };
  }

  /**
   * Get available episodes for an anime
   *
   * @param anilistId - AniList anime ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 100)
   * @returns List of available episodes with pagination
   */
  async getAvailableEpisodes(
    anilistId: number,
    page: number = 1,
    limit: number = 100
  ): Promise<AvailableEpisodesResponse> {
    const validId = this._validateId(anilistId, 'AniList ID');

    this.logger.info(
      `[StreamingService] Getting available episodes for AniList ID: ${validId} (page: ${page}, limit: ${limit})`
    );

    const hianimeId = await this._getOrSyncHianimeId(validId);

    if (this.providerMode === 'aniwatch') {
      const episodesData = await this.aniwatchClient.getAnimeEpisodes(hianimeId, page, limit);

      this.logger.debug(
        `[StreamingService] Found ${episodesData.episodes.length} episodes (page ${episodesData.pagination?.currentPage}/${episodesData.pagination?.totalPages})`
      );

      return {
        anilistId: validId,
        hianimeId,
        totalEpisodes: episodesData.totalEpisodes,
        episodes: episodesData.episodes,
        pagination: episodesData.pagination,
      };
    }

    const episodesData = await this.aniProviderClient.getEpisodes(hianimeId, { refresh: false });
    const allEpisodes = this._toEpisodeInfoList(episodesData.items);

    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(500, Math.max(1, limit));
    const totalPages = Math.max(1, Math.ceil(allEpisodes.length / normalizedLimit));
    const startIndex = (normalizedPage - 1) * normalizedLimit;
    const pagedEpisodes = allEpisodes.slice(startIndex, startIndex + normalizedLimit);

    this.logger.debug(`[StreamingService] Found ${pagedEpisodes.length} episodes from AniProvider`);

    return {
      anilistId: validId,
      hianimeId,
      totalEpisodes: episodesData.total,
      episodes: pagedEpisodes,
      pagination: {
        currentPage: normalizedPage,
        totalPages,
        pageSize: normalizedLimit,
        totalItems: episodesData.total,
        hasNextPage: normalizedPage < totalPages,
        hasPreviousPage: normalizedPage > 1,
      },
    };
  }

  /**
   * Get available servers for a specific episode
   *
   * @param anilistId - AniList anime ID
   * @param episodeNumber - Episode number
   * @returns Available servers for the episode
   */
  async getEpisodeServers(
    anilistId: number,
    episodeNumber: number
  ): Promise<EpisodeServersResponse> {
    const validAnilistId = this._validateId(anilistId, 'AniList ID');
    const validEpisodeNumber = this._validateId(episodeNumber, 'Episode Number');

    this.logger.info(`[StreamingService] Getting episode servers:`, {
      anilistId: validAnilistId,
      episodeNumber: validEpisodeNumber,
    });

    const hianimeId = await this._getOrSyncHianimeId(validAnilistId);

    if (this.providerMode === 'aniwatch') {
      const episodesData = await this.aniwatchClient.getAnimeEpisodes(hianimeId, 1, 10000);
      const episode = episodesData.episodes.find((ep) => ep.number === validEpisodeNumber);

      if (!episode) {
        throw new NotFoundError(
          `Episode ${validEpisodeNumber} not found for anime ${validAnilistId}`
        );
      }

      const servers = await this.aniwatchClient.getEpisodeServers(episode.episodeId);

      this.logger.debug(
        `[StreamingService] Found servers - sub: ${servers.sub.length}, dub: ${servers.dub.length}, raw: ${servers.raw.length}`
      );

      return {
        ...servers,
        anilistId: validAnilistId,
        episodeNumber: validEpisodeNumber,
        hianimeId,
      };
    }

    const episodesData = await this.aniProviderClient.getEpisodes(hianimeId, { refresh: false });
    const episode = this._findEpisodeByNumber(episodesData, validEpisodeNumber);

    if (!episode) {
      throw new NotFoundError(
        `Episode ${validEpisodeNumber} not found for anime ${validAnilistId}`
      );
    }

    return {
      episodeId: episode.episodeId,
      episodeNo: validEpisodeNumber,
      sub: [{ serverId: 1, serverName: 'aniprovider' }],
      dub: [],
      raw: [],
      anilistId: validAnilistId,
      episodeNumber: validEpisodeNumber,
      hianimeId,
    };
  }

  async getTaskStatus(taskId: string, requestId?: string): Promise<StreamingTaskStatusResponse> {
    const normalizedTaskId = this._validateString(taskId, 'Task ID', {
      minLength: 8,
      maxLength: 128,
    });

    if (this.providerMode === 'aniwatch') {
      throw new ValidationError('Task polling is only available in AniProvider mode');
    }

    const taskResponse = await this.aniProviderClient.getTaskStatus(normalizedTaskId, requestId);
    const mappedResult = this._mapTaskResult(taskResponse.result);

    return {
      taskId: taskResponse.task_id,
      status: taskResponse.status,
      ...(mappedResult && { result: mappedResult }),
      ...(taskResponse.error && { error: taskResponse.error }),
    };
  }

  /**
   * Get HiAnime ID from database or sync from MALSync
   *
   * @private
   * @param anilistId - AniList anime ID
   * @returns HiAnime identifier
   */
  private async _getOrSyncHianimeId(anilistId: number): Promise<string> {
    let anime = await this.animeRepository.findByAnilistId(anilistId);

    if (!anime) {
      this.logger.debug(
        `[StreamingService] Anime ${anilistId} not found in DB, auto-syncing from AniList...`
      );
      await this.animeService.getAnimeDetails(anilistId);
      anime = await this.animeRepository.findByAnilistId(anilistId);

      if (!anime) {
        throw new NotFoundError(
          `Anime with AniList ID ${anilistId} not found on AniList or failed to sync`
        );
      }
    }

    if (anime.idHianime) {
      return anime.idHianime;
    }

    this.logger.debug(`[StreamingService] HiAnime ID not found, syncing...`);
    const syncResult = await this.syncHianimeId(anilistId);
    return syncResult.hianimeId;
  }

  /**
   * Validate HiAnime identifier format and length
   *
   * @private
   * @param hianimeId - HiAnime identifier to validate
   * @throws {ValidationError} If identifier is invalid
   *
   * @remarks
   * HiAnime ID can be:
   * - Numeric: "100"
   * - Slug: "one-piece-100"
   * - Must be <= 100 characters (database constraint)
   * - Must not contain special characters except hyphen
   */
  private _validateHianimeId(hianimeId: string | null): void {
    if (!hianimeId || hianimeId.trim().length === 0) {
      throw new ValidationError('HiAnime ID cannot be empty');
    }

    if (hianimeId.length > 100) {
      throw new ValidationError(
        `HiAnime ID is too long (${hianimeId.length} chars). Maximum is 100 characters.`
      );
    }

    const validFormatRegex = /^[a-zA-Z0-9-?=]+$/;
    if (!validFormatRegex.test(hianimeId)) {
      throw new ValidationError(
        'HiAnime ID contains invalid characters. Only alphanumeric, hyphens, and query params are allowed.'
      );
    }

    this.logger.debug(`[StreamingService] HiAnime ID validated: ${hianimeId}`);
  }

  private _findEpisodeByNumber(
    response: AniProviderEpisodesResponse,
    episodeNumber: number
  ): EpisodeInfo | undefined {
    return this._toEpisodeInfoList(response.items).find(
      (episode) => episode.number === episodeNumber
    );
  }

  private _toEpisodeInfoList(items: AniProviderEpisodesResponse['items']): EpisodeInfo[] {
    return items.map((item) => ({
      number: item.order,
      order: item.order,
      title: item.title,
      episodeId: item.episode_id,
      episodeUrl: item.episode_url,
    }));
  }

  private _mapSourcesSuccess(
    upstreamEpisodeId: string,
    sources: AniProviderSourcesSuccessResponse
  ): EpisodeSourcesData {
    return {
      streamLinks: sources.stream_links,
      subtitles: sources.vtt_links.map((url) => ({
        url,
        lang: this._detectSubtitleLanguage(url),
      })),
      capturedAt: sources.captured_at,
      upstreamEpisodeId,
      meta: {
        refreshed: sources.meta.refreshed,
        source: sources.meta.source,
      },
    };
  }

  private _mapTaskResult(result: unknown): EpisodeSourcesData | undefined {
    if (!result || typeof result !== 'object') {
      return undefined;
    }

    const payload = result as Record<string, unknown>;
    const streamLinks = Array.isArray(payload.stream_links)
      ? payload.stream_links.filter((item): item is string => typeof item === 'string')
      : [];
    const vttLinks = Array.isArray(payload.vtt_links)
      ? payload.vtt_links.filter((item): item is string => typeof item === 'string')
      : [];
    const capturedAt = typeof payload.captured_at === 'string' ? payload.captured_at : undefined;
    const episodeId = typeof payload.episode_id === 'string' ? payload.episode_id : undefined;
    const metaObj =
      payload.meta && typeof payload.meta === 'object'
        ? (payload.meta as Record<string, unknown>)
        : null;

    if (!capturedAt || !episodeId || !metaObj) {
      return undefined;
    }

    return {
      streamLinks,
      subtitles: vttLinks.map((url) => ({
        url,
        lang: this._detectSubtitleLanguage(url),
      })),
      capturedAt,
      upstreamEpisodeId: episodeId,
      meta: {
        refreshed: Boolean(metaObj.refreshed),
        source: typeof metaObj.source === 'string' ? metaObj.source : 'rapidcloud_capture_async',
      },
    };
  }

  private _detectSubtitleLanguage(url: string): string {
    const normalized = url.toLowerCase();

    if (normalized.includes('.vi.') || normalized.includes('/vi.') || normalized.includes('-vi.')) {
      return 'vi';
    }

    if (normalized.includes('.en.') || normalized.includes('/en.') || normalized.includes('-en.')) {
      return 'en';
    }

    return 'unknown';
  }
}

export default StreamingService;
