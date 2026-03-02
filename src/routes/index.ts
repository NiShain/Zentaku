import type { Router } from 'express';
import express from 'express';

/**
 * Initialize main application routes with dependency injection
 * @param {Object} container - DI container instance
 * @returns {Router} Express router with all configured routes
 */
const initializeRoutes = (container: unknown): Router => {
  const router = express.Router();

  const animeRoutes = require('../modules/anime/anime.routes');
  const readingMediaRoutes = require('../modules/reading-media/reading-media.routes');
  const streamingRoutes = require('../modules/streaming/streaming.routes');

  router.use('/anilist/anime', animeRoutes(container));
  router.use('/anilist', readingMediaRoutes(container));
  router.use('/streaming', streamingRoutes(container));
  return router;
};

export = initializeRoutes;
