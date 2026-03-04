import type AnilistReadingMediaClient from '../../../infrastructure/external/anilist/reading-media/AnilistReadingMediaClient';
import type { NovelSearchCriteria } from '../types/criteria.types';
import type { MediaSearchParams, SearchResult } from '../types/search.types';

/**
 * Novel Search Service
 * Calls external API client directly for novel search
 */
class NovelSearchService {
  private readingMediaClient: AnilistReadingMediaClient;

  constructor(readingMediaClient: AnilistReadingMediaClient) {
    this.readingMediaClient = readingMediaClient;
  }

  async searchByText(params: MediaSearchParams): Promise<SearchResult<unknown>> {
    const { q, page = 1, perPage = 20 } = params;

    const results = await this.readingMediaClient.searchByFormatGroup(q, 'novel', {
      page,
      perPage,
    });

    return {
      success: true,
      data: {
        items: results.media,
        pageInfo: {
          total: results.pageInfo.total || 0,
          currentPage: results.pageInfo.currentPage || page,
          lastPage: results.pageInfo.lastPage || 1,
          hasNextPage: results.pageInfo.hasNextPage || false,
          perPage: results.pageInfo.perPage || perPage,
        },
        source: 'external',
      },
    };
  }

  async searchByCriteria(_criteria: NovelSearchCriteria): Promise<SearchResult<unknown>> {
    // TODO: Implement when needed
    throw new Error('Advanced criteria search not yet implemented');
  }
}

export default NovelSearchService;
