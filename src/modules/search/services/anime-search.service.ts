import type { SearchResult as CoreSearchResult } from '../../../core/base/BaseMediaService';
import type AnimeService from '../../anime/anime.service';
import type { AnimeSearchCriteria } from '../types/criteria.types';
import type { MediaSearchParams, SearchResult } from '../types/search.types';

/**
 * Anime Search Service
 * Implements hybrid search strategy: DB cache → External API fallback
 */
class AnimeSearchService {
  private animeService: AnimeService;

  constructor(animeService: AnimeService) {
    this.animeService = animeService;
  }

  async searchByText(params: MediaSearchParams): Promise<SearchResult<unknown>> {
    const { q, page = 1, perPage = 20 } = params;

    let dbResults: CoreSearchResult<unknown> | null = null;
    try {
      dbResults = await this.animeService.search(q, page, perPage);

      if (dbResults.items.length >= 3) {
        return {
          success: true,
          data: {
            items: dbResults.items,
            pageInfo: {
              total: dbResults.pagination.total,
              currentPage: dbResults.pagination.currentPage,
              lastPage: dbResults.pagination.totalPages,
              hasNextPage: dbResults.pagination.hasNextPage,
              perPage: dbResults.pagination.perPage,
            },
            source: 'database',
          },
        };
      }
    } catch (error) {
      console.warn('DB search failed, falling back to external API', error);
    }

    const externalResults = await this.animeService.searchExternal(q, {
      page,
      perPage,
      cacheTopResults: 5,
    });

    return {
      success: true,
      data: {
        items: externalResults.items,
        pageInfo: externalResults.pageInfo as SearchResult<unknown>['data']['pageInfo'],
        source: 'external',
        cached: externalResults.cached,
      },
    };
  }

  async searchByCriteria(
    criteria: AnimeSearchCriteria,
    options: { page?: number; perPage?: number } = {}
  ): Promise<SearchResult<unknown>> {
    const { page = 1, perPage = 20 } = options;
    const { query: _query, sort, format, status, ...otherFilters } = criteria;

    const results = await this.animeService.searchByCriteria(
      {
        ...otherFilters,
        format: format ? format[0] : undefined,
        status: status ? status[0] : undefined,
      },
      {
        page,
        perPage,
        sort: sort || ['POPULARITY_DESC'],
        cacheTopResults: 5,
      }
    );

    return {
      success: true,
      data: {
        items: results.items,
        pageInfo: results.pageInfo as SearchResult<unknown>['data']['pageInfo'],
        source: 'external',
        cached: results.cached,
      },
    };
  }

  async getCurrentlyAiring(page: number = 1, perPage: number = 20): Promise<SearchResult<unknown>> {
    return this.searchByCriteria(
      {
        status: ['RELEASING'],
        sort: ['POPULARITY_DESC'],
      },
      { page, perPage }
    );
  }

  async getSeasonal(
    season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL',
    year: number,
    options: { page?: number; perPage?: number; sort?: string[] } = {}
  ): Promise<SearchResult<unknown>> {
    const { page = 1, perPage = 20, sort = ['POPULARITY_DESC'] } = options;

    const results = await this.animeService.getSeasonal(season, year, {
      page,
      perPage,
      sort,
    });

    return {
      success: true,
      data: {
        items: results.items,
        pageInfo: results.pageInfo as SearchResult<unknown>['data']['pageInfo'],
        source: 'external',
      },
    };
  }
}

export default AnimeSearchService;
