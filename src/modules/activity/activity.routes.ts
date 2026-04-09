import express, { type Router } from 'express';
import type { Container } from '../../config/container';
import type ActivityController from './controllers/activity.controller';

const initializeActivityRoutes = (container: Container): Router => {
  const router = express.Router();
  const activityController = container.resolve<ActivityController>('activityController');

  /**
   * @swagger
   * /api/users/{userId}/activities:
   *   get:
   *     summary: Get user activities
   *     tags: [Activity]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *           default: DESC
   *     responses:
   *       200:
   *         description: User activities retrieved successfully
   */
  router.get('/users/:userId/activities', activityController.getUserActivities);

  /**
   * @swagger
   * /api/users/{userId}/activities/range:
   *   get:
   *     summary: Get user activities by time range
   *     tags: [Activity]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: startDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: endDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *           default: DESC
   *     responses:
   *       200:
   *         description: Filtered activities retrieved successfully
   */
  router.get('/users/:userId/activities/range', activityController.getUserActivitiesByTimeRange);

  /**
   * @swagger
   * /api/users/{userId}/activities/heatmap:
   *   get:
   *     summary: Get user activity heatmap by year
   *     tags: [Activity]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: year
   *         schema:
   *           type: integer
   *           default: 2026
   *     responses:
   *       200:
   *         description: Heatmap data retrieved successfully
   */
  router.get('/users/:userId/activities/heatmap', activityController.getUserActivityHeatmap);

  /**
   * @swagger
   * /api/activities/recent:
   *   get:
   *     summary: Get recent activity feed
   *     tags: [Activity]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *     responses:
   *       200:
   *         description: Recent activities retrieved successfully
   */
  router.get('/activities/recent', activityController.getRecentActivities);

  return router;
};

export = initializeActivityRoutes;
