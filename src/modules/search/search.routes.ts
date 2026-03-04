import express, { type Router } from 'express';
import SearchValidator from './search.validator';

/**
 * Initialize search routes with dependency injection
 *
 * @param {Object} container - DI container instance
 * @returns {Router} Express router with configured routes
 */
const initializeSearchRoutes = (container: any): Router => {
  const router = express.Router();

  const searchController = container.resolve('searchController');

  // ============================================
  // GLOBAL SEARCH
  // ============================================

  /**
   * @swagger
   * /search:
   *   get:
   *     summary: Global search across multiple media types
   *     description: Search across anime, manga, and novel simultaneously. Returns aggregated results from specified types.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *           minLength: 2
   *           maxLength: 100
   *         description: Search query string
   *         example: naruto
   *       - in: query
   *         name: types
   *         required: false
   *         schema:
   *           type: string
   *         description: Comma-separated list of types to search (anime, manga, novel, all)
   *         example: anime,manga
   *       - in: query
   *         name: page
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: perPage
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 20
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Search results
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     anime:
   *                       type: object
   *                     manga:
   *                       type: object
   *                     novel:
   *                       type: object
   *       400:
   *         description: Invalid request parameters
   *       500:
   *         description: Server error
   */
  router.get(
    '/',
    SearchValidator.globalSearchRules(),
    SearchValidator.validate,
    searchController.globalSearch
  );

  // ============================================
  // TYPE-SPECIFIC SEARCH
  // ============================================

  /**
   * @swagger
   * /search/anime:
   *   get:
   *     summary: Search anime
   *     description: Search for anime with optional filters (genre, year, season, etc.)
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *           minLength: 2
   *           maxLength: 100
   *         description: Search query
   *         example: attack on titan
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 20
   *       - in: query
   *         name: genres
   *         schema:
   *           type: string
   *         description: Comma-separated genre list
   *         example: Action,Adventure
   *       - in: query
   *         name: year
   *         schema:
   *           type: integer
   *         description: Release year
   *         example: 2024
   *       - in: query
   *         name: season
   *         schema:
   *           type: string
   *           enum: [WINTER, SPRING, SUMMER, FALL]
   *         description: Release season
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Airing status
   *       - in: query
   *         name: format
   *         schema:
   *           type: string
   *         description: Comma-separated format list (TV, MOVIE, OVA, etc.)
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *         description: Comma-separated sort fields
   *       - in: query
   *         name: isAdult
   *         schema:
   *           type: boolean
   *         description: Include adult content
   *     responses:
   *       200:
   *         description: Anime search results
   *       400:
   *         description: Invalid parameters
   *       500:
   *         description: Server error
   */
  router.get(
    '/anime',
    SearchValidator.animeSearchRules(),
    SearchValidator.validate,
    searchController.searchAnime
  );

  /**
   * @swagger
   * /search/manga:
   *   get:
   *     summary: Search manga
   *     description: Search for manga (excluding novels)
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query
   *         example: one piece
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           maximum: 50
   *           default: 20
   *     responses:
   *       200:
   *         description: Manga search results
   *       400:
   *         description: Invalid parameters
   *       500:
   *         description: Server error
   */
  router.get(
    '/manga',
    SearchValidator.readingMediaSearchRules(),
    SearchValidator.validate,
    searchController.searchManga
  );

  /**
   * @swagger
   * /search/novel:
   *   get:
   *     summary: Search novels
   *     description: Search for light novels and novels
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query
   *         example: sword art online
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           maximum: 50
   *           default: 20
   *     responses:
   *       200:
   *         description: Novel search results
   *       400:
   *         description: Invalid parameters
   *       500:
   *         description: Server error
   */
  router.get(
    '/novel',
    SearchValidator.readingMediaSearchRules(),
    SearchValidator.validate,
    searchController.searchNovel
  );

  // ============================================
  // DISCOVERY & TRENDING
  // ============================================

  /**
   * @swagger
   * /search/trending:
   *   get:
   *     summary: Get trending media
   *     description: Retrieve currently trending anime, manga, or novels. Results are cached for 30 minutes.
   *     tags:
   *       - Discovery
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [anime, manga, novel, all]
   *           default: all
   *         description: Media type to get trending for
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 10
   *         description: Number of results
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *     responses:
   *       200:
   *         description: Trending media list
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     trending:
   *                       type: array
   *                     pageInfo:
   *                       type: object
   *       400:
   *         description: Invalid parameters
   *       500:
   *         description: Server error
   */
  router.get(
    '/trending',
    SearchValidator.trendingRules(),
    SearchValidator.validate,
    searchController.getTrending
  );

  /**
   * @swagger
   * /search/popular:
   *   get:
   *     summary: Get popular media
   *     description: Retrieve popular media by type and time range
   *     tags:
   *       - Discovery
   *     parameters:
   *       - in: query
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: [anime, manga, novel]
   *         description: Media type
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [week, month, year, all]
   *           default: all
   *         description: Time range for popularity
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           maximum: 50
   *           default: 20
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *     responses:
   *       200:
   *         description: Popular media list
   *       400:
   *         description: Invalid parameters
   *       500:
   *         description: Server error
   */
  router.get(
    '/popular',
    SearchValidator.popularRules(),
    SearchValidator.validate,
    searchController.getPopular
  );

  /**
   * @swagger
   * /search/seasonal:
   *   get:
   *     summary: Get seasonal anime
   *     description: Retrieve anime for a specific season and year. Results are cached for 1 hour.
   *     tags:
   *       - Discovery
   *     parameters:
   *       - in: query
   *         name: season
   *         required: true
   *         schema:
   *           type: string
   *           enum: [WINTER, SPRING, SUMMER, FALL]
   *         description: Season
   *         example: FALL
   *       - in: query
   *         name: year
   *         required: true
   *         schema:
   *           type: integer
   *         description: Year
   *         example: 2024
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           maximum: 50
   *           default: 20
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *         description: Comma-separated sort fields
   *     responses:
   *       200:
   *         description: Seasonal anime list
   *       400:
   *         description: Invalid parameters
   *       500:
   *         description: Server error
   */
  router.get(
    '/seasonal',
    SearchValidator.seasonalRules(),
    SearchValidator.validate,
    searchController.getSeasonalAnime
  );

  /**
   * @swagger
   * /search/seasonal/current:
   *   get:
   *     summary: Get current season anime
   *     description: Automatically detect current season and return anime for it
   *     tags:
   *       - Discovery
   *     responses:
   *       200:
   *         description: Current season anime list
   *       500:
   *         description: Server error
   */
  router.get('/seasonal/current', searchController.getCurrentSeason);

  /**
   * @swagger
   * /search/seasonal/next:
   *   get:
   *     summary: Get next season anime
   *     description: Automatically detect next season and return anime for it
   *     tags:
   *       - Discovery
   *     responses:
   *       200:
   *         description: Next season anime list
   *       500:
   *         description: Server error
   */
  router.get('/seasonal/next', searchController.getNextSeason);

  return router;
};

export = initializeSearchRoutes;
