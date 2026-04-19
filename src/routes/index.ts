import type { Router } from 'express';
import express from 'express';

/**
 * Initialize main application routes with dependency injection
 * @param {Object} container - DI container instance
 * @returns {Router} Express router with all configured routes
 */
const initializeRoutes = (container: unknown): Router => {
  const router = express.Router();

  const authRoutes = require('../modules/auth/auth.routes');
  const animeRoutes = require('../modules/anime/anime.routes');
  const readingMediaRoutes = require('../modules/reading-media/reading-media.routes');
  const streamingRoutes = require('../modules/streaming/streaming.routes');
  const searchRoutes = require('../modules/search/search.routes');

  const listRoutes = require('../modules/list/list.routes');
  const userRoutes = require('../modules/user/user.routes');
  const activityRoutes = require('../modules/activity/activity.routes');
  const followRoutes = require('../modules/follow/follow.routes');

  router.use('/auth', authRoutes(container));
  router.use('/user', userRoutes(container));
  router.use('/anilist/anime', animeRoutes(container));
  router.use('/anilist', readingMediaRoutes(container));
  router.use('/streaming', streamingRoutes(container));

  /**
   * @swagger
   * /api/tasks/{taskId}:
   *   get:
   *     tags:
   *       - Streaming
   *     summary: Get upstream async task status
   *     description: Poll AniProvider task status through the Node bridge endpoint
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Task status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StreamingTaskStatusResponse'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */

  const { validateGetTaskStatus } = require('../modules/streaming/streaming.validator');
  router.get(
    '/tasks/:taskId',
    validateGetTaskStatus,
    (container as any).resolve('streamingController').getTaskStatus
  );

  router.use('/', activityRoutes(container));
  router.use('/', followRoutes(container));

  router.use('/search', searchRoutes(container));
  router.use('/list', listRoutes(container));
  return router;
};

export = initializeRoutes;
