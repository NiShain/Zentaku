/**
 * Media Category Types
 *
 * IMPORTANT: Both Anilist API and internal database use only 2 types:
 * - ANIME: Anime content (TV, Movie, OVA, ONA, Special, Music)
 * - MANGA: All reading media (differentiated by format field)
 *   - Manga formats: MANGA, ONE_SHOT, MANHWA, MANHUA
 *   - Novel formats: NOVEL, LIGHT_NOVEL
 */
export type MediaCategory = 'anime' | 'manga' | 'novel' | 'character' | 'staff' | 'all';

export type MediaType = 'ANIME' | 'MANGA';

export interface BaseSearchParams {
  q: string;
  page?: number;
  perPage?: number;
}

export interface MediaSearchParams extends BaseSearchParams {
  genres?: string[];
  year?: number;
  season?: string;
  status?: string;
  format?: string[];
  sort?: string[];
  isAdult?: boolean;
}

export interface GlobalSearchParams extends BaseSearchParams {
  types?: MediaCategory[];
}

export interface SearchResult<T> {
  success: boolean;
  data: {
    items: T[];
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
      perPage: number;
    };
    source?: 'database' | 'external';
    cached?: number;
  };
}

export interface GlobalSearchResult {
  success: boolean;
  data: {
    anime?: SearchResult<unknown>['data'];
    manga?: SearchResult<unknown>['data'];
    novel?: SearchResult<unknown>['data'];
  };
}

/**
 * Media Summary
 * type field is either ANIME or MANGA
 */
export interface MediaSummary {
  id: number;
  type: MediaType;
  idAnilist: number;
  titleRomaji: string;
  titleEnglish?: string;
  titleNative?: string;
  coverImage?: string;
  bannerImage?: string;
  format?: string;
  status: string;
  averageScore?: number;
  popularity?: number;
  genres?: string[];
  isAdult?: boolean;
  episodeCount?: number;
  chapters?: number;
  volumes?: number;
  season?: string;
  seasonYear?: number;
}
