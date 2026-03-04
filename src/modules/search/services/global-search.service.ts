import type {
  GlobalSearchParams,
  GlobalSearchResult,
  MediaCategory,
  SearchResult,
} from '../types/search.types';
import type AnimeSearchService from './anime-search.service';
import type MangaSearchService from './manga-search.service';
import type NovelSearchService from './novel-search.service';

/**
 * Global Search Service
 * Orchestrates multi-domain search across anime, manga, and novel types
 * Each search service calls external API directly (no DB caching)
 */
class GlobalSearchService {
  private animeSearchService: AnimeSearchService;
  private mangaSearchService: MangaSearchService;
  private novelSearchService: NovelSearchService;

  constructor(
    animeSearchService: AnimeSearchService,
    mangaSearchService: MangaSearchService,
    novelSearchService: NovelSearchService
  ) {
    this.animeSearchService = animeSearchService;
    this.mangaSearchService = mangaSearchService;
    this.novelSearchService = novelSearchService;
  }

  /**
   * Search across multiple media types in parallel
   * Each search service calls external API directly
   */
  async search(params: GlobalSearchParams): Promise<GlobalSearchResult> {
    const { q, types = ['all'], page = 1, perPage = 20 } = params;

    const searchTypes: MediaCategory[] = types.includes('all')
      ? ['anime', 'manga', 'novel']
      : types;

    const searchPromises: Promise<unknown>[] = [];
    const result: GlobalSearchResult = {
      success: true,
      data: {},
    };

    if (searchTypes.includes('anime')) {
      searchPromises.push(
        this.animeSearchService
          .searchByText({ q, page, perPage })
          .then((animeResults: SearchResult<unknown>) => {
            result.data.anime = animeResults.data;
          })
          .catch((error: Error) => {
            console.error('Anime search failed:', error);
            result.data.anime = {
              items: [],
              pageInfo: this.getEmptyPageInfo(page, perPage),
            };
          })
      );
    }

    if (searchTypes.includes('manga')) {
      searchPromises.push(
        this.mangaSearchService
          .searchByText({ q, page, perPage })
          .then((mangaResults: SearchResult<unknown>) => {
            result.data.manga = mangaResults.data;
          })
          .catch((error: Error) => {
            console.error('Manga search failed:', error);
            result.data.manga = {
              items: [],
              pageInfo: this.getEmptyPageInfo(page, perPage),
            };
          })
      );
    }

    if (searchTypes.includes('novel')) {
      searchPromises.push(
        this.novelSearchService
          .searchByText({ q, page, perPage })
          .then((novelResults: SearchResult<unknown>) => {
            result.data.novel = novelResults.data;
          })
          .catch((error: Error) => {
            console.error('Novel search failed:', error);
            result.data.novel = {
              items: [],
              pageInfo: this.getEmptyPageInfo(page, perPage),
            };
          })
      );
    }

    await Promise.all(searchPromises);

    return result;
  }

  private getEmptyPageInfo(page: number, perPage: number) {
    return {
      total: 0,
      currentPage: page,
      lastPage: 0,
      hasNextPage: false,
      perPage,
    };
  }
}

export default GlobalSearchService;
