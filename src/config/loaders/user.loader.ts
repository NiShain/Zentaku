import type { Container } from '../container';
import logger from '../../shared/utils/logger';

/**
 * Load user module dependencies into container
 */
const loadUser = (container: Container): void => {
  if (!container.has('userRepository')) {
    container.register(
      'userRepository',
      (c: any) => {
        const { User } = require('../../entities');
        const { UserRepository } = require('../../modules/user/repositories/user.repository');
        const dataSource = c.resolve('dataSource');
        const typeormRepository = dataSource.getRepository(User);

        return new UserRepository(typeormRepository);
      },
      {
        singleton: true,
        dependencies: ['dataSource'],
      }
    );
  }

  container.register(
    'userService',
    (c: any) => {
      const { UserService } = require('../../modules/user/services/user.service');
      const userRepository = c.resolve('userRepository');
      return new UserService(userRepository);
    },
    {
      singleton: true,
      dependencies: ['userRepository'],
    }
  );

  container.register(
    'userController',
    (c: any) => {
      const UserController =
        require('../../modules/user/controllers/user.controller').default ||
        require('../../modules/user/controllers/user.controller');
      const userService = c.resolve('userService');
      return new UserController(userService);
    },
    {
      singleton: true,
      dependencies: ['userService'],
    }
  );

  logger.info('[Loader] User module registered');
};

export = loadUser;
