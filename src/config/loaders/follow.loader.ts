import logger from '../../shared/utils/logger';
import type { Container } from '../container';

const loadFollow = (container: Container): void => {
  if (!container.has('libraryEntryRepository')) {
    container.register(
      'libraryEntryRepository',
      (c: any) => {
        const { LibraryEntry } = require('../../entities');
        const {
          LibraryEntryRepository,
        } = require('../../modules/follow/repositories/library-entry.repository');
        const dataSource = c.resolve('dataSource');
        const typeormRepository = dataSource.getRepository(LibraryEntry);

        return new LibraryEntryRepository(typeormRepository);
      },
      {
        singleton: true,
        dependencies: ['dataSource'],
      }
    );
  }

  if (!container.has('userRelationshipRepository')) {
    container.register(
      'userRelationshipRepository',
      (c: any) => {
        const { UserRelationship } = require('../../entities');
        const {
          UserRelationshipRepository,
        } = require('../../modules/follow/repositories/user-relationship.repository');
        const dataSource = c.resolve('dataSource');
        const typeormRepository = dataSource.getRepository(UserRelationship);

        return new UserRelationshipRepository(typeormRepository);
      },
      {
        singleton: true,
        dependencies: ['dataSource'],
      }
    );
  }

  container.register(
    'followService',
    (c: any) => {
      const { FollowService } = require('../../modules/follow/services/follow.service');
      const libraryEntryRepository = c.resolve('libraryEntryRepository');
      const userRelationshipRepository = c.resolve('userRelationshipRepository');
      const activityService = c.resolve('activityService');
      const dataSource = c.resolve('dataSource');

      return new FollowService(
        libraryEntryRepository,
        userRelationshipRepository,
        activityService,
        dataSource
      );
    },
    {
      singleton: true,
      dependencies: [
        'libraryEntryRepository',
        'userRelationshipRepository',
        'activityService',
        'dataSource',
      ],
    }
  );

  container.register(
    'followController',
    (c: any) => {
      const FollowController =
        require('../../modules/follow/controllers/follow.controller').default ||
        require('../../modules/follow/controllers/follow.controller');
      const followService = c.resolve('followService');
      return new FollowController(followService);
    },
    {
      singleton: true,
      dependencies: ['followService'],
    }
  );

  logger.info('[Loader] Follow module registered');
};

export = loadFollow;
