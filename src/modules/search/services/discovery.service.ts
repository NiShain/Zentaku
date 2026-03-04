import type AnilistAnimeClient from '../../../infrastructure/external/anilist/anime/AnilistAnimeClient';
import type { SeasonalParams } from '../types/discovery.types';
import type { MediaSummary } from '../types/search.types';

interface DiscoveryResult {
  success: boolean;
  data: {
    results: MediaSummary[];
    pageInfo: {
      currentPage: number;
      hasNextPage: boolean;
      total: number;
      perPage: number;
    };
  };
}

class DiscoveryService {
  private animeClient: AnilistAnimeClient;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();

  constructor(animeClient: AnilistAnimeClient) {
    this.animeClient = animeClient;
  }

  async getSeasonalAnime(params: SeasonalParams): Promise<DiscoveryResult> {
    const { season, year, page = 1, perPage = 20, sort = ['POPULARITY_DESC'] } = params;

    const cacheKey = `seasonal:${season}:${year}:${page}:${perPage}:${sort.join(',')}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as DiscoveryResult;
    }

    try {
      const results = await this.fetchSeasonalAnime(season, year, page, perPage, sort);

      const result: DiscoveryResult = {
        success: true,
        data: {
          results: results as unknown as MediaSummary[],
          pageInfo: {
            currentPage: page,
            hasNextPage: results.length === perPage,
            total: results.length,
            perPage,
          },
        },
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch seasonal anime: ${error}`);
    }
  }

  async getCurrentSeason(): Promise<DiscoveryResult> {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();

    let season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
    if (month >= 0 && month <= 2) season = 'WINTER';
    else if (month >= 3 && month <= 5) season = 'SPRING';
    else if (month >= 6 && month <= 8) season = 'SUMMER';
    else season = 'FALL';

    return this.getSeasonalAnime({ season, year });
  }

  async getNextSeason(): Promise<DiscoveryResult> {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    let year = now.getFullYear();

    let season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
    if (month >= 0 && month <= 2) {
      season = 'SPRING';
    } else if (month >= 3 && month <= 5) {
      season = 'SUMMER';
    } else if (month >= 6 && month <= 8) {
      season = 'FALL';
    } else {
      season = 'WINTER';
      year += 1; // Winter of next year
    }

    return this.getSeasonalAnime({ season, year });
  }

  private async fetchSeasonalAnime(
    season: string,
    year: number,
    page: number,
    perPage: number,
    sort: string[]
  ) {
    const criteria = {
      season: season as 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL',
      seasonYear: year,
      sort: sort as (
        | 'POPULARITY_DESC'
        | 'SCORE_DESC'
        | 'TRENDING_DESC'
        | 'UPDATED_AT_DESC'
        | 'START_DATE_DESC'
      )[],
    };

    const response = await this.animeClient.searchByCriteria(criteria, { page, perPage });
    return response.media;
  }

  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default DiscoveryService;
