import type { Request, Response } from 'express';
import type AnimeSearchService from './services/anime-search.service';
import type DiscoveryService from './services/discovery.service';
import type GlobalSearchService from './services/global-search.service';
import type MangaSearchService from './services/manga-search.service';
import type NovelSearchService from './services/novel-search.service';
import type TrendingService from './services/trending.service';
import type { MediaCategory } from './types/search.types';

class SearchController {
  private globalSearchService: GlobalSearchService;
  private animeSearchService: AnimeSearchService;
  private mangaSearchService: MangaSearchService;
  private novelSearchService: NovelSearchService;
  private trendingService: TrendingService;
  private discoveryService: DiscoveryService;

  constructor(
    globalSearchService: GlobalSearchService,
    animeSearchService: AnimeSearchService,
    mangaSearchService: MangaSearchService,
    novelSearchService: NovelSearchService,
    trendingService: TrendingService,
    discoveryService: DiscoveryService
  ) {
    this.globalSearchService = globalSearchService;
    this.animeSearchService = animeSearchService;
    this.mangaSearchService = mangaSearchService;
    this.novelSearchService = novelSearchService;
    this.trendingService = trendingService;
    this.discoveryService = discoveryService;

    this.globalSearch = this.globalSearch.bind(this);
    this.searchAnime = this.searchAnime.bind(this);
    this.searchManga = this.searchManga.bind(this);
    this.searchNovel = this.searchNovel.bind(this);
    this.getTrending = this.getTrending.bind(this);
    this.getPopular = this.getPopular.bind(this);
    this.getSeasonalAnime = this.getSeasonalAnime.bind(this);
    this.getCurrentSeason = this.getCurrentSeason.bind(this);
    this.getNextSeason = this.getNextSeason.bind(this);
  }

  /**
   * Global search across multiple types
   * GET /api/search?q={query}&types=anime,manga,novel&page=1&perPage=20
   */
  async globalSearch(req: Request, res: Response): Promise<void> {
    try {
      const { q, types, page, perPage } = req.query;

      const typesArray = types
        ? (types as string).split(',').map((t) => t.trim() as MediaCategory)
        : (['all'] as MediaCategory[]);

      const result = await this.globalSearchService.search({
        q: q as string,
        types: typesArray,
        page: page ? parseInt(page as string, 10) : 1,
        perPage: perPage ? parseInt(perPage as string, 10) : 20,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform global search',
      });
    }
  }

  /**
   * Search anime
   * GET /api/search/anime?q={query}&page=1&perPage=20
   */
  async searchAnime(req: Request, res: Response): Promise<void> {
    try {
      const { q, page, perPage, genres, year, season, status, format, sort, isAdult } = req.query;

      const result = await this.animeSearchService.searchByText({
        q: q as string,
        page: page ? parseInt(page as string, 10) : 1,
        perPage: perPage ? parseInt(perPage as string, 10) : 20,
        genres: genres ? (genres as string).split(',') : undefined,
        year: year ? parseInt(year as string, 10) : undefined,
        season: season as string | undefined,
        status: status as string | undefined,
        format: format ? (format as string).split(',') : undefined,
        sort: sort ? (sort as string).split(',') : undefined,
        isAdult: isAdult === 'true',
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search anime',
      });
    }
  }

  /**
   * Search manga
   * GET /api/search/manga?q={query}&page=1&perPage=20
   */
  async searchManga(req: Request, res: Response): Promise<void> {
    try {
      const { q, page, perPage } = req.query;

      const result = await this.mangaSearchService.searchByText({
        q: q as string,
        page: page ? parseInt(page as string, 10) : 1,
        perPage: perPage ? parseInt(perPage as string, 10) : 20,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search manga',
      });
    }
  }

  /**
   * Search novel
   * GET /api/search/novel?q={query}&page=1&perPage=20
   */
  async searchNovel(req: Request, res: Response): Promise<void> {
    try {
      const { q, page, perPage } = req.query;

      const result = await this.novelSearchService.searchByText({
        q: q as string,
        page: page ? parseInt(page as string, 10) : 1,
        perPage: perPage ? parseInt(perPage as string, 10) : 20,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search novel',
      });
    }
  }

  /**
   * Get trending media
   * GET /api/search/trending?type=all&perPage=10&page=1
   */
  async getTrending(req: Request, res: Response): Promise<void> {
    try {
      const { type, perPage, page } = req.query;

      const result = await this.trendingService.getTrending({
        type: (type as 'anime' | 'manga' | 'novel' | 'all') || 'all',
        perPage: perPage ? parseInt(perPage as string, 10) : 10,
        page: page ? parseInt(page as string, 10) : 1,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get trending media',
      });
    }
  }

  /**
   * Get popular media
   * GET /api/search/popular?type=anime&timeRange=month&perPage=20&page=1
   */
  async getPopular(req: Request, res: Response): Promise<void> {
    try {
      const { type, timeRange, perPage, page } = req.query;

      const result = await this.trendingService.getPopular({
        type: (type as 'anime' | 'manga' | 'novel') || 'anime',
        timeRange: (timeRange as 'week' | 'month' | 'year' | 'all') || 'all',
        perPage: perPage ? parseInt(perPage as string, 10) : 20,
        page: page ? parseInt(page as string, 10) : 1,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get popular media',
      });
    }
  }

  /**
   * Get seasonal anime
   * GET /api/search/seasonal?season=FALL&year=2024&perPage=20&page=1
   */
  async getSeasonalAnime(req: Request, res: Response): Promise<void> {
    try {
      const { season, year, perPage, page, sort } = req.query;

      const result = await this.discoveryService.getSeasonalAnime({
        season: season as 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL',
        year: parseInt(year as string, 10),
        perPage: perPage ? parseInt(perPage as string, 10) : 20,
        page: page ? parseInt(page as string, 10) : 1,
        sort: sort
          ? ((sort as string).split(',') as ('POPULARITY_DESC' | 'SCORE_DESC' | 'TRENDING_DESC')[])
          : undefined,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get seasonal anime',
      });
    }
  }

  /**
   * Get current season anime
   * GET /api/search/seasonal/current
   */
  async getCurrentSeason(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.discoveryService.getCurrentSeason();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current season anime',
      });
    }
  }

  /**
   * Get next season anime
   * GET /api/search/seasonal/next
   */
  async getNextSeason(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.discoveryService.getNextSeason();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get next season anime',
      });
    }
  }
}

export default SearchController;
