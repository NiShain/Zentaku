import type AnilistReadingMediaClient from '../../../infrastructure/external/anilist/reading-media/AnilistReadingMediaClient';
import type { MangaSearchCriteria } from '../types/criteria.types';
import type { MediaSearchParams, SearchResult } from '../types/search.types';

/**
 * Manga Search Service
 * Calls external API client directly for manga search
 */
class MangaSearchService {
  private readingMediaClient: AnilistReadingMediaClient;

  constructor(readingMediaClient: AnilistReadingMediaClient) {
    this.readingMediaClient = readingMediaClient;
  }

  async searchByText(params: MediaSearchParams): Promise<SearchResult<unknown>> {
    const { q, page = 1, perPage = 20 } = params;

    const results = await this.readingMediaClient.searchByFormatGroup(q, 'manga', {
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

  async searchByCriteria(_criteria: MangaSearchCriteria): Promise<SearchResult<unknown>> {
    // TODO: Implement when needed
    throw new Error('Advanced criteria search not yet implemented');
  }
}

export default MangaSearchService;
