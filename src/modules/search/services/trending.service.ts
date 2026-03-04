import type AnilistAnimeClient from '../../../infrastructure/external/anilist/anime/AnilistAnimeClient';
import type AnilistReadingMediaClient from '../../../infrastructure/external/anilist/reading-media/AnilistReadingMediaClient';
import type { PopularParams, TrendingParams, TrendingResult } from '../types/discovery.types';
import type { MediaSummary } from '../types/search.types';

/**
 * Trending Service
 * Handles trending and popular media discovery via direct API calls
 */
class TrendingService {
  private animeClient: AnilistAnimeClient;
  private readingMediaClient: AnilistReadingMediaClient;

  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private cache: Map<string, { data: TrendingResult; timestamp: number }> = new Map();

  constructor(animeClient: AnilistAnimeClient, readingMediaClient: AnilistReadingMediaClient) {
    this.animeClient = animeClient;
    this.readingMediaClient = readingMediaClient;
  }

  /**
   * Get trending media
   */
  async getTrending(params: TrendingParams): Promise<TrendingResult> {
    const { type = 'all', page = 1, perPage = 10 } = params;
    const cacheKey = `trending:${type}:${page}:${perPage}`;

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result: TrendingResult = {
      success: true,
      data: {
        trending: [],
        pageInfo: {
          currentPage: page,
          hasNextPage: false,
          perPage,
        },
      },
    };

    try {
      if (type === 'anime' || type === 'all') {
        const animeResults = await this.fetchTrendingAnime(page, perPage);
        result.data.trending.push(...(animeResults as unknown as MediaSummary[]));
      }

      if (type === 'manga' || type === 'all') {
        const mangaResults = await this.fetchTrendingManga(page, perPage);
        result.data.trending.push(...(mangaResults as unknown as MediaSummary[]));
      }

      if (type === 'novel' || type === 'all') {
        const novelResults = await this.fetchTrendingNovel(page, perPage);
        result.data.trending.push(...(novelResults as unknown as MediaSummary[]));
      }

      this.setCache(cacheKey, result);
    } catch (error) {
      console.error('Trending fetch error:', error);
      result.success = false;
    }

    return result;
  }

  /**
   * Get popular media by time range
   */
  async getPopular(params: PopularParams): Promise<TrendingResult> {
    const { type, timeRange = 'all', page = 1, perPage = 20 } = params;
    const cacheKey = `popular:${type}:${timeRange}:${page}:${perPage}`;

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result: TrendingResult = {
      success: true,
      data: {
        trending: [],
        pageInfo: {
          currentPage: page,
          hasNextPage: false,
          perPage,
        },
      },
    };

    try {
      if (type === 'anime') {
        const animeResults = await this.fetchPopularAnime(page, perPage);
        result.data.trending.push(...(animeResults as unknown as MediaSummary[]));
      } else if (type === 'manga') {
        const mangaResults = await this.fetchPopularManga(page, perPage);
        result.data.trending.push(...(mangaResults as unknown as MediaSummary[]));
      } else if (type === 'novel') {
        const novelResults = await this.fetchPopularNovel(page, perPage);
        result.data.trending.push(...(novelResults as unknown as MediaSummary[]));
      }

      this.setCache(cacheKey, result);
    } catch (error) {
      console.error('Popular fetch error:', error);
      result.success = false;
    }

    return result;
  }

  /**
   * Private helper methods
   */
  private async fetchTrendingAnime(page: number, perPage: number) {
    const results = await this.animeClient.searchByCriteria(
      {},
      {
        page,
        perPage,
        sort: ['TRENDING_DESC'],
      }
    );
    return results.media || [];
  }

  private async fetchTrendingManga(page: number, perPage: number) {
    const results = await this.readingMediaClient.searchByCriteria(
      {
        formats: ['MANGA', 'ONE_SHOT'],
      },
      {
        page,
        perPage,
        sort: ['TRENDING_DESC'],
      }
    );
    return results.media || [];
  }

  private async fetchTrendingNovel(page: number, perPage: number) {
    const results = await this.readingMediaClient.searchByCriteria(
      {
        formats: ['NOVEL'],
      },
      {
        page,
        perPage,
        sort: ['TRENDING_DESC'],
      }
    );
    return results.media || [];
  }

  private async fetchPopularAnime(page: number, perPage: number) {
    const results = await this.animeClient.searchByCriteria(
      {},
      {
        page,
        perPage,
        sort: ['POPULARITY_DESC'],
      }
    );
    return results.media || [];
  }

  private async fetchPopularManga(page: number, perPage: number) {
    const results = await this.readingMediaClient.searchByCriteria(
      {
        formats: ['MANGA', 'ONE_SHOT'],
      },
      {
        page,
        perPage,
        sort: ['POPULARITY_DESC'],
      }
    );
    return results.media || [];
  }

  private async fetchPopularNovel(page: number, perPage: number) {
    const results = await this.readingMediaClient.searchByCriteria(
      {
        formats: ['NOVEL'],
      },
      {
        page,
        perPage,
        sort: ['POPULARITY_DESC'],
      }
    );
    return results.media || [];
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): TrendingResult | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: TrendingResult): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export default TrendingService;
