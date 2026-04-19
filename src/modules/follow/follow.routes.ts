import express, { type Router } from 'express';
import type { Container } from '../../config/container';
import { authenticate } from '../../middlewares/authenticate';
import type FollowController from './controllers/follow.controller';

const initializeFollowRoutes = (container: Container): Router => {
  const router = express.Router();
  const followController = container.resolve<FollowController>('followController');

  router.use(authenticate);

  /**
   * @swagger
   * /api/follows/media/{anilistId}:
   *   post:
   *     summary: Follow a media item
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: anilistId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: Media followed successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       409:
   *         description: Already followed
   */
  router.post('/follows/media/:anilistId', followController.followMedia);

  /**
   * @swagger
   * /api/follows/media/{anilistId}:
   *   patch:
   *     summary: Update manual tracking for a media item
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: anilistId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [WATCHING, READING, COMPLETED, PLANNING, DROPPED, PAUSED]
   *               progress:
   *                 type: integer
   *                 minimum: 0
   *               progressVolumes:
   *                 type: integer
   *                 minimum: 0
   *                 nullable: true
   *               score:
   *                 type: number
   *                 minimum: 0
   *                 nullable: true
   *               notes:
   *                 type: string
   *                 nullable: true
   *               isPrivate:
   *                 type: boolean
   *               rewatchCount:
   *                 type: integer
   *                 minimum: 0
   *               startDate:
   *                 type: string
   *                 format: date
   *                 nullable: true
   *               finishDate:
   *                 type: string
   *                 format: date
   *                 nullable: true
   *     responses:
   *       200:
   *         description: Media tracking updated successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         description: Unauthorized
   */
  router.patch('/follows/media/:anilistId', followController.updateMediaTracking);

  /**
   * @swagger
   * /api/follows/media/{anilistId}:
   *   delete:
   *     summary: Unfollow a media item
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: anilistId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Media unfollowed successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Not followed
   */
  router.delete('/follows/media/:anilistId', followController.unfollowMedia);

  /**
   * @swagger
   * /api/follows/media/{anilistId}:
   *   get:
   *     summary: Get media follow status
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: anilistId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Follow status retrieved successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         description: Unauthorized
   */
  router.get('/follows/media/:anilistId', followController.getMediaFollowStatus);

  /**
   * @swagger
   * /api/follows/users/{targetUserId}:
   *   post:
   *     summary: Follow a user
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: targetUserId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: User followed successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       409:
   *         description: Already followed
   */
  router.post('/follows/users/:targetUserId', followController.followUser);

  /**
   * @swagger
   * /api/follows/users/{targetUserId}:
   *   delete:
   *     summary: Unfollow a user
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: targetUserId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User unfollowed successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Not followed
   */
  router.delete('/follows/users/:targetUserId', followController.unfollowUser);

  /**
   * @swagger
   * /api/follows/users/{targetUserId}:
   *   get:
   *     summary: Get user follow status
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: targetUserId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Follow status retrieved successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         description: Unauthorized
   */
  router.get('/follows/users/:targetUserId', followController.getUserFollowStatus);

  return router;
};

export = initializeFollowRoutes;
