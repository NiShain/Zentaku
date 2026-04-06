/**
 * Streaming Controller
 *
 * HTTP controller for streaming endpoints.
 * Inherits from BaseController for response helpers and error handling.
 *
 * @extends BaseController
 */

import type { Request, Response } from 'express';
import { BaseController } from '../../core/base/BaseController';
import type { AudioCategory, StreamingServer } from '../../core/types/streaming.types';
import type StreamingService from './streaming.service';

const BOOLEAN_LIKE_TRUE_VALUES = new Set(['1', 'true', 'yes', 'y']);

const parseBooleanLike = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return false;
  }

  return BOOLEAN_LIKE_TRUE_VALUES.has(value.trim().toLowerCase());
};

const parseOptionalBooleanLike = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return parseBooleanLike(value);
};

const parseOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

class StreamingController extends BaseController<StreamingService> {
  constructor(service: StreamingService) {
    super(service);
    this.logger.info('[StreamingController] Initialized');
  }

  /**
   * GET /streaming/:anilistId/episodes/:episodeNumber/sources
   * Get streaming sources for a specific episode
   *
   * @param req - Express request
   * @param res - Express response
   */
  getEpisodeSources = this.asyncHandler(async (req: Request, res: Response) => {
    const anilistId = this.getIntParam(req, 'anilistId');
    const episodeNumber = this.getIntParam(req, 'episodeNumber');
    const server = parseOptionalString(req.query.server) as StreamingServer | undefined;
    const category = parseOptionalString(req.query.category) as AudioCategory | undefined;
    const requestId = req.requestId;
    const refresh = parseOptionalBooleanLike(req.query.refresh);
    const asyncMode = parseOptionalBooleanLike(req.query.async);

    this.logInfo('Fetching episode sources', {
      anilistId,
      episodeNumber,
      refresh,
      asyncMode,
      requestId,
      server,
      category,
    });

    const sources = await this.service.getEpisodeSources(
      anilistId,
      episodeNumber,
      refresh,
      asyncMode,
      server,
      category,
      requestId
    );

    return this.success(res, sources, sources.status === 'pending' ? 202 : 200);
  });

  /**
   * GET /streaming/:anilistId/episodes
   * Get all available episodes for an anime
   *
   * @param req - Express request
   * @param res - Express response
   */
  getEpisodes = this.asyncHandler(async (req: Request, res: Response) => {
    const anilistId = this.getIntParam(req, 'anilistId');
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    this.logInfo('Fetching available episodes', { anilistId, page, limit });

    const episodes = await this.service.getAvailableEpisodes(anilistId, page, limit);

    return this.success(res, episodes);
  });

  /**
   * GET /streaming/:anilistId/episodes/:episodeNumber/servers
   * Get available servers for a specific episode
   *
   * @param req - Express request
   * @param res - Express response
   */
  getEpisodeServers = this.asyncHandler(async (req: Request, res: Response) => {
    const anilistId = this.getIntParam(req, 'anilistId');
    const episodeNumber = this.getIntParam(req, 'episodeNumber');

    this.logInfo('Fetching episode servers', { anilistId, episodeNumber });

    const servers = await this.service.getEpisodeServers(anilistId, episodeNumber);

    return this.success(res, servers);
  });

  /**
   * POST /streaming/:anilistId/sync
   * Manually trigger HiAnime ID sync
   *
   * @param req - Express request
   * @param res - Express response
   */
  syncHianimeId = this.asyncHandler(async (req: Request, res: Response) => {
    const anilistId = this.getIntParam(req, 'anilistId');

    this.logInfo('Syncing HiAnime ID', { anilistId });

    const syncResult = await this.service.syncHianimeId(anilistId);

    return this.success(res, syncResult, 200);
  });

  /**
   * GET /streaming/tasks/:taskId
   * Get async task status from AniProvider
   */
  getTaskStatus = this.asyncHandler(async (req: Request, res: Response) => {
    const taskId = String(req.params.taskId || '');
    const requestId = req.requestId;

    this.logInfo('Fetching task status', { taskId, requestId });

    const taskStatus = await this.service.getTaskStatus(taskId, requestId);

    return this.success(res, taskStatus);
  });
}

export default StreamingController;
