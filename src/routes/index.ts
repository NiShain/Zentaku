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
  const userRoutes = require('../modules/user/user.routes');
  const listRoutes = require('../modules/list/list.routes');

  router.use('/auth', authRoutes(container));
  router.use('/user', userRoutes(container));
  router.use('/anilist/anime', animeRoutes(container));
  router.use('/anilist', readingMediaRoutes(container));
  router.use('/streaming', streamingRoutes(container));
  router.use('/search', searchRoutes(container));
  router.use('/list', listRoutes(container));
  return router;
};

export = initializeRoutes;
