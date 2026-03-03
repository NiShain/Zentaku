/**
 * Discovery & Trending Types
 *
 * Note: 'novel' is a user-facing category for convenience.
 * Internally, novels are MANGA type with NOVEL/LIGHT_NOVEL format.
 */

import type { MediaSummary } from './search.types';

export interface TrendingParams {
  type?: 'anime' | 'manga' | 'novel' | 'all';
  perPage?: number;
  page?: number;
}

export interface SeasonalParams {
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  year: number;
  perPage?: number;
  page?: number;
  sort?: ('POPULARITY_DESC' | 'SCORE_DESC' | 'TRENDING_DESC')[];
}

export interface PopularParams {
  type: 'anime' | 'manga' | 'novel';
  timeRange?: 'week' | 'month' | 'year' | 'all';
  perPage?: number;
  page?: number;
}

export interface TrendingResult {
  success: boolean;
  data: {
    trending: MediaSummary[];
    pageInfo: {
      currentPage: number;
      hasNextPage: boolean;
      perPage: number;
    };
  };
}
