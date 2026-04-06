/**
 * Dependency Injection Container
 *
 * Central registry for managing all application dependencies.
 *
 * @module Container
 */

import logger from '../shared/utils/logger';

/**
 * Factory function type that creates instances
 */
type FactoryFunction<T = unknown> = (container: Container) => T;

interface RegistrationOptions {
  singleton?: boolean;
  dependencies?: string[];
  [key: string]: unknown;
}

/**
 * Internal dependency configuration
 */
interface DependencyConfig<T = unknown> {
  factory: FactoryFunction<T>;
  options: {
    singleton: boolean;
    dependencies: string[];
    [key: string]: unknown;
  };
}

/**
 * Dependency Injection Container Class
 */
class Container {
  /**
   * Map of registered dependencies
   * @private
   */
  private dependencies: Map<string, DependencyConfig>;

  /**
   * Cache for singleton instances
   * @private
   */
  private singletons: Map<string, any>;

  /**
   * Flag to track if container has been initialized
   * @private
   */
  private initialized: boolean;

  constructor() {
    this.dependencies = new Map();
    this.singletons = new Map();
    this.initialized = false;
  }

  /**
   * Register a dependency in the container
   *
   * @param {string} name - Unique identifier for the dependency
   * @param {Function} factory - Factory function that creates the instance
   * @param {Object} options - Registration options
   * @param {boolean} [options.singleton=true] - Whether to cache as singleton
   * @param {Array<string>} [options.dependencies=[]] - List of dependency names
   *
   * @example
   * container.register('animeService', (c) => {
   *   return new AnimeService(
   *     c.resolve('animeRepository'),
   *     c.resolve('animeAdapter')
   *   );
   * }, { singleton: true });
   */
  register<T = unknown>(
    name: string,
    factory: FactoryFunction<T>,
    options: RegistrationOptions = {}
  ): void {
    if (typeof name !== 'string' || !name) {
      throw new Error('Dependency name must be a non-empty string');
    }

    if (typeof factory !== 'function') {
      throw new Error(`Factory for '${name}' must be a function`);
    }

    const config: DependencyConfig<T> = {
      factory,
      options: {
        singleton: options.singleton !== undefined ? options.singleton : true,
        dependencies: options.dependencies || [],
        ...options,
      },
    };

    this.dependencies.set(name, config);
    logger.debug(`[Container] Registered: ${name} (singleton: ${config.options.singleton})`);
  }

  /**
   * Resolve a dependency from the container
   *
   * @param {string} name - Name of the dependency to resolve
   * @returns {any} The resolved dependency instance
   * @throws {Error} If dependency is not registered
   *
   * @example
   * const animeService = container.resolve('animeService');
   */
  resolve<T = unknown>(name: string): T {
    const config = this.dependencies.get(name);

    if (!config) {
      throw new Error(`Dependency '${name}' is not registered in the container`);
    }

    if (config.options.singleton && this.singletons.has(name)) {
      return this.singletons.get(name) as T;
    }

    try {
      logger.debug(`[Container] Resolving: ${name}`);
      const instance = config.factory(this);

      if (config.options.singleton) {
        this.singletons.set(name, instance);
        logger.debug(`[Container] Cached singleton: ${name}`);
      }

      return instance as T;
    } catch (error: any) {
      logger.error(`[Container] Failed to resolve '${name}': ${error.message}`);
      throw new Error(`Failed to resolve dependency '${name}': ${error.message}`);
    }
  }

  /**
   * Create a new instance (force transient, ignore singleton cache)
   *
   * @param {string} name - Name of the dependency
   * @returns {any} A new instance of the dependency
   */
  create<T = unknown>(name: string): T {
    const config = this.dependencies.get(name);

    if (!config) {
      throw new Error(`Dependency '${name}' is not registered in the container`);
    }

    logger.debug(`[Container] Creating new instance: ${name}`);
    return config.factory(this) as T;
  }

  /**
   * Check if a dependency is registered
   *
   * @param {string} name - Name of the dependency
   * @returns {boolean} True if registered
   */
  has(name: string): boolean {
    return this.dependencies.has(name);
  }

  clearSingletons(): void {
    this.singletons.clear();
    logger.debug('[Container] Cleared all singleton instances');
  }

  reset(): void {
    this.dependencies.clear();
    this.singletons.clear();
    this.initialized = false;
    logger.debug('[Container] Container reset');
  }

  getRegistered(): string[] {
    return Array.from(this.dependencies.keys());
  }

  /**
   * Initialize the container and verify all critical dependencies
   * Call this during application startup
   *
   * @returns {Promise<void>}
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('[Container] Already initialized, skipping...');
      return;
    }

    try {
      logger.info('[Container] Starting initialization...');

      const { initializeDatabase } = require('./database');
      await initializeDatabase();
      logger.info('[Container] TypeORM DataSource initialized ✓');

      const criticalDeps = [
        'dataSource',
        'httpClient',
        'anilistAnimeClient',
        'anilistReadingMediaClient',
        'animeAdapter',
        'animeRepository',
        'animeService',
        'animeController',
        'readingMediaAdapter',
        'readingMediaRepository',
        'readingMediaService',
        'readingMediaController',
        'malSyncClient',
        'aniwatchClient',
        'aniProviderClient',
        'streamingService',
        'streamingController',
      ];

      for (const dep of criticalDeps) {
        this.resolve(dep);
        logger.debug(`[Container] ✓ ${dep} ready`);
      }

      this.initialized = true;
      logger.info('[Container] Initialization complete ✓');
      logger.info(`[Container] Registered dependencies: ${this.getRegistered().join(', ')}`);
    } catch (error: any) {
      logger.error(`[Container] Initialization failed: ${error.message}`);
      throw new Error(`Container initialization failed: ${error.message}`);
    }
  }

  async shutdown(): Promise<void> {
    try {
      logger.info('[Container] Starting graceful shutdown...');

      if (this.singletons.has('dataSource')) {
        const dataSource = this.singletons.get('dataSource');
        if (dataSource && typeof dataSource.destroy === 'function') {
          await dataSource.destroy();
          logger.info('[Container] TypeORM DataSource disconnected');
        }
      }

      this.clearSingletons();
      logger.info('[Container] Shutdown complete ✓');
    } catch (error: any) {
      logger.error(`[Container] Shutdown error: ${error.message}`);
      throw error;
    }
  }
}

const container = new Container();
const loadModules = require('./loaders');
loadModules(container);

export default container;
export type { Container };
