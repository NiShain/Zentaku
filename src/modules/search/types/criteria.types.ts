/**
 * Advanced Search Criteria Types
 *
 * IMPORTANT: Both Anilist API and internal database use only 2 types (ANIME, MANGA)
 * All reading media use MANGA type and are differentiated by format field:
 * - Manga formats: MANGA, ONE_SHOT, MANHWA, MANHUA
 * - Novel formats: NOVEL, LIGHT_NOVEL
 */

/**
 * Anime Search Criteria
 * Type: ANIME
 */
export interface AnimeSearchCriteria {
  query?: string;
  genres?: string[];
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  seasonYear?: number;
  format?: ('TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'MUSIC')[];
  status?: ('FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED')[];
  episodes_gte?: number;
  episodes_lte?: number;
  duration_gte?: number;
  duration_lte?: number;
  averageScore_gte?: number;
  popularity_gte?: number;
  isAdult?: boolean;
  page?: number;
  perPage?: number;
  sort?: (
    | 'POPULARITY_DESC'
    | 'SCORE_DESC'
    | 'TRENDING_DESC'
    | 'UPDATED_AT_DESC'
    | 'START_DATE_DESC'
  )[];
}

/**
 * Manga Search Criteria
 * Type: MANGA with formats [MANGA, ONE_SHOT, MANHWA, MANHUA]
 */
export interface MangaSearchCriteria {
  query?: string;
  genres?: string[];
  format?: ('MANGA' | 'ONE_SHOT' | 'MANHWA' | 'MANHUA')[];
  status?: ('FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED')[];
  chapters_gte?: number;
  chapters_lte?: number;
  volumes_gte?: number;
  volumes_lte?: number;
  averageScore_gte?: number;
  popularity_gte?: number;
  isAdult?: boolean;
  page?: number;
  perPage?: number;
  sort?: (
    | 'POPULARITY_DESC'
    | 'SCORE_DESC'
    | 'TRENDING_DESC'
    | 'UPDATED_AT_DESC'
    | 'START_DATE_DESC'
  )[];
}

/**
 * Novel Search Criteria
 * Type: MANGA with formats [NOVEL, LIGHT_NOVEL]
 * Note: Novels are also MANGA type, differentiated by format field
 */
export interface NovelSearchCriteria {
  query?: string;
  genres?: string[];
  format?: ('NOVEL' | 'LIGHT_NOVEL')[];
  status?: ('FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED')[];
  chapters_gte?: number;
  volumes_gte?: number;
  averageScore_gte?: number;
  popularity_gte?: number;
  isAdult?: boolean;
  page?: number;
  perPage?: number;
  sort?: ('POPULARITY_DESC' | 'SCORE_DESC' | 'TRENDING_DESC')[];
}
