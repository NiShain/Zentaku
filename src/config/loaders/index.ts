/**
 * Container Loaders Index
 *
 * @module Loaders
 */

import logger from '../../shared/utils/logger';
import type { Container } from '../container';
import authLoader = require('./auth.loader');
import infrastructureLoader = require('./infrastructure.loader');
import animeLoader = require('./anime.loader');
import readingMediaLoader = require('./reading-media.loader');
import streamingLoader = require('./streaming.loader');
import searchLoader = require('./search.loader');
import listLoader = require('./list.loader');
import userLoader = require('./user.loader');
import activityLoader = require('./activity.loader');
import followLoader = require('./follow.loader');

/**
 * Load all modules into the container

 * @param {Container} container - DI Container instance
 */
const loadModules = (container: Container): void => {
  logger.debug('[Loaders] Starting module registration...');

  infrastructureLoader(container);

  authLoader(container);

  userLoader(container);

  animeLoader(container);

  readingMediaLoader(container);

  streamingLoader(container);

  searchLoader(container);

  listLoader(container);
  activityLoader(container);
  followLoader(container);

  logger.debug('[Loaders] All modules registered successfully');
  logger.debug(`[Loaders] Total registered: ${container.getRegistered().length} dependencies`);
};

export = loadModules;
