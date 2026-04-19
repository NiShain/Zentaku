import logger from '../../shared/utils/logger';
import type { Container } from '../container';

const loadActivity = (container: Container): void => {
  if (!container.has('activityRepository')) {
    container.register(
      'activityRepository',
      (c: any) => {
        const { Activity } = require('../../entities');
        const {
          ActivityRepository,
        } = require('../../modules/activity/repositories/activity.repository');
        const dataSource = c.resolve('dataSource');
        const typeormRepository = dataSource.getRepository(Activity);

        return new ActivityRepository(typeormRepository);
      },
      {
        singleton: true,
        dependencies: ['dataSource'],
      }
    );
  }

  container.register(
    'activityService',
    (c: any) => {
      const { ActivityService } = require('../../modules/activity/services/activity.service');
      const activityRepository = c.resolve('activityRepository');
      return new ActivityService(activityRepository);
    },
    {
      singleton: true,
      dependencies: ['activityRepository'],
    }
  );

  container.register(
    'activityController',
    (c: any) => {
      const ActivityController =
        require('../../modules/activity/controllers/activity.controller').default ||
        require('../../modules/activity/controllers/activity.controller');
      const activityService = c.resolve('activityService');
      return new ActivityController(activityService);
    },
    {
      singleton: true,
      dependencies: ['activityService'],
    }
  );

  logger.info('[Loader] Activity module registered');
};

export = loadActivity;
