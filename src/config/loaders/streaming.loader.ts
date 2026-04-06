/**
 * Streaming Module Container Loader
 *
 * @module StreamingLoader
 */

import logger from '../../shared/utils/logger';

const loadStreaming = (container: any): void => {
  //Load MALSync Client
  container.register(
    'malSyncClient',
    () => {
      const { MalSyncClient } = require('../../infrastructure/external/malsync');
      return new MalSyncClient();
    },
    { singleton: true }
  );

  //Load AniProvider Client
  container.register(
    'aniProviderClient',
    () => {
      const { AniProviderClient } = require('../../infrastructure/external/aniprovider');
      return new AniProviderClient();
    },
    { singleton: true }
  );

  //Load Streaming Service
  container.register(
    'streamingService',
    (c: any) => {
      const StreamingService = require('../../modules/streaming/streaming.service').default;
      const animeRepository = c.resolve('animeRepository');
      const animeService = c.resolve('animeService');
      const malSyncClient = c.resolve('malSyncClient');
      const aniProviderClient = c.resolve('aniProviderClient');

      return new StreamingService(animeRepository, animeService, malSyncClient, aniProviderClient);
    },
    {
      singleton: true,
      dependencies: ['animeRepository', 'animeService', 'malSyncClient', 'aniProviderClient'],
    }
  );

  //Load Streaming Controller
  container.register(
    'streamingController',
    (c: any) => {
      const StreamingController = require('../../modules/streaming/streaming.controller').default;
      const streamingService = c.resolve('streamingService');

      return new StreamingController(streamingService);
    },
    {
      singleton: true,
      dependencies: ['streamingService'],
    }
  );

  logger.info('[Loader] Streaming module registered');
};

export = loadStreaming;
