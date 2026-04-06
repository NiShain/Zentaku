import type { NextFunction, Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import {
  AUDIO_CATEGORIES,
  STREAMING_SERVERS,
} from '../../infrastructure/external/aniwatch/aniwatch.types';

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

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        statusCode: 400,
        details: errors.array(),
      },
    });
    return;
  }
  next();
};

export const validateGetEpisodeSources = [
  param('anilistId').isInt({ min: 1 }).withMessage('AniList ID must be a positive integer').toInt(),

  param('episodeNumber')
    .isInt({ min: 1 })
    .withMessage('Episode number must be a positive integer')
    .toInt(),

  query('server')
    .optional()
    .isIn([...STREAMING_SERVERS])
    .withMessage(`Invalid server. Must be one of: ${STREAMING_SERVERS.join(', ')}`),

  query('category')
    .optional()
    .isIn([...AUDIO_CATEGORIES])
    .withMessage(`Invalid category. Must be one of: ${AUDIO_CATEGORIES.join(', ')}`),

  query('refresh').optional().customSanitizer(parseBooleanLike),

  query('async').optional().customSanitizer(parseBooleanLike),

  handleValidationErrors,
];

export const validateGetEpisodes = [
  param('anilistId').isInt({ min: 1 }).withMessage('AniList ID must be a positive integer').toInt(),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Limit must be between 1 and 500')
    .toInt(),

  handleValidationErrors,
];

export const validateGetEpisodeServers = [
  param('anilistId').isInt({ min: 1 }).withMessage('AniList ID must be a positive integer').toInt(),

  param('episodeNumber')
    .isInt({ min: 1 })
    .withMessage('Episode number must be a positive integer')
    .toInt(),

  handleValidationErrors,
];

export const validateSyncHianimeId = [
  param('anilistId').isInt({ min: 1 }).withMessage('AniList ID must be a positive integer').toInt(),

  handleValidationErrors,
];

export const validateGetTaskStatus = [
  param('taskId')
    .isString()
    .matches(/^[a-zA-Z0-9-]{8,128}$/)
    .withMessage('Task ID is invalid'),

  handleValidationErrors,
];
