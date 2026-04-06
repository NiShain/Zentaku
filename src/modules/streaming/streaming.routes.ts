import { Router } from 'express';
import {
  validateGetEpisodes,
  validateGetEpisodeServers,
  validateGetEpisodeSources,
  validateGetTaskStatus,
  validateSyncHianimeId,
} from './streaming.validator';

/**
 * Create streaming routes with dependency injection
 *
 * @param container - DI container instance
 * @returns Express router
 */
const createStreamingRoutes = (container: unknown): Router => {
  const router = Router();
  const controller = (container as any).resolve('streamingController');

  /**
   * @swagger
   * /api/streaming/{anilistId}/sync:
   *   post:
   *     tags:
   *       - Streaming
   *     summary: Sync HiAnime ID for an anime
   *     description: Manually trigger synchronization of HiAnime ID from MALSync for the specified anime
   *     parameters:
   *       - in: path
   *         name: anilistId
   *         required: true
   *         schema:
   *           type: integer
   *         description: AniList anime ID
   *         example: 21
   *     responses:
   *       200:
   *         description: HiAnime ID synced successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SyncHianimeIdResponse'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  router.post('/:anilistId/sync', validateSyncHianimeId, controller.syncHianimeId);

  /**
   * @swagger
   * /api/streaming/tasks/{taskId}:
   *   get:
   *     tags:
   *       - Streaming
   *     summary: Get async streaming task status
   *     description: Poll AniProvider task status after requesting async episode sources
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *         description: AniProvider task identifier
   *     responses:
   *       200:
   *         description: Task status retrieved successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  router.get('/tasks/:taskId', validateGetTaskStatus, controller.getTaskStatus);

  /**
   * @swagger
   * /api/streaming/{anilistId}/episodes/{episodeNumber}/servers:
   *   get:
   *     tags:
   *       - Streaming
   *     summary: Get available servers for a specific episode
   *     description: Retrieves list of available streaming servers for an episode (sub/dub/raw)
   *     parameters:
   *       - in: path
   *         name: anilistId
   *         required: true
   *         schema:
   *           type: integer
   *         description: AniList anime ID
   *         example: 21
   *       - in: path
   *         name: episodeNumber
   *         required: true
   *         schema:
   *           type: integer
   *         description: Episode number
   *         example: 1
   *     responses:
   *       200:
   *         description: Episode servers retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EpisodeServersResponse'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  router.get(
    '/:anilistId/episodes/:episodeNumber/servers',
    validateGetEpisodeServers,
    controller.getEpisodeServers
  );

  /**
   * @swagger
   * /api/streaming/{anilistId}/episodes/{episodeNumber}/sources:
   *   get:
   *     tags:
   *       - Streaming
   *     summary: Get streaming sources for a specific episode
   *     description: Retrieves streaming video sources, subtitles, and metadata for a specific anime episode
   *     parameters:
   *       - in: path
   *         name: anilistId
   *         required: true
   *         schema:
   *           type: integer
   *         description: AniList anime ID
   *         example: 21
   *       - in: path
   *         name: episodeNumber
   *         required: true
   *         schema:
   *           type: integer
   *         description: Episode number
   *         example: 1
   *       - in: query
   *         name: server
   *         required: false
   *         schema:
   *           type: string
   *           enum: [hd-1, hd-2, meg-1, meg-2]
   *         description: Preferred streaming server
   *         example: hd-1
   *       - in: query
   *         name: category
   *         required: false
   *         schema:
   *           type: string
   *           enum: [sub, dub, raw]
   *         description: Audio category (subtitle/dubbed/raw)
   *         example: sub
   *       - in: query
   *         name: refresh
   *         required: false
   *         schema:
   *           type: boolean
   *         description: Force refresh from upstream provider
   *         example: false
   *       - in: query
   *         name: async
   *         required: false
   *         schema:
   *           type: boolean
   *         description: Enqueue async crawling task and return pending metadata
   *         example: true
   *     responses:
   *       200:
   *         description: Streaming sources retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EpisodeSourcesResponse'
   *       202:
   *         description: Async source capture task accepted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EpisodeSourcesPendingResponse'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  router.get(
    '/:anilistId/episodes/:episodeNumber/sources',
    validateGetEpisodeSources,
    controller.getEpisodeSources
  );

  /**
   * @swagger
   * /api/streaming/{anilistId}/episodes:
   *   get:
   *     tags:
   *       - Streaming
   *     summary: Get all available episodes for an anime
   *     description: Retrieves a complete list of available episodes with their metadata (with pagination support)
   *     parameters:
   *       - in: path
   *         name: anilistId
   *         required: true
   *         schema:
   *           type: integer
   *         description: AniList anime ID
   *         example: 21
   *       - in: query
   *         name: page
   *         required: false
   *         schema:
   *           type: integer
   *           default: 1
   *           minimum: 1
   *         description: Page number for pagination
   *         example: 1
   *       - in: query
   *         name: limit
   *         required: false
   *         schema:
   *           type: integer
   *           default: 100
   *           minimum: 1
   *           maximum: 500
   *         description: Number of episodes per page
   *         example: 100
   *     responses:
   *       200:
   *         description: Episodes list retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AvailableEpisodesResponse'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  router.get('/:anilistId/episodes', validateGetEpisodes, controller.getEpisodes);

  return router;
};

export = createStreamingRoutes;
