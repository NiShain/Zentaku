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
   * /api/users/{userId}/follows/media/{mediaId}:
   *   post:
   *     summary: Follow a media item
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: mediaId
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
  router.post('/users/:userId/follows/media/:mediaId', followController.followMedia);

  /**
   * @swagger
   * /api/users/{userId}/follows/media/{mediaId}:
   *   delete:
   *     summary: Unfollow a media item
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: mediaId
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
  router.delete('/users/:userId/follows/media/:mediaId', followController.unfollowMedia);

  /**
   * @swagger
   * /api/users/{userId}/follows/media/{mediaId}:
   *   get:
   *     summary: Get media follow status
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: mediaId
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
  router.get('/users/:userId/follows/media/:mediaId', followController.getMediaFollowStatus);

  /**
   * @swagger
   * /api/users/{userId}/follows/users/{targetUserId}:
   *   post:
   *     summary: Follow a user
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
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
  router.post('/users/:userId/follows/users/:targetUserId', followController.followUser);

  /**
   * @swagger
   * /api/users/{userId}/follows/users/{targetUserId}:
   *   delete:
   *     summary: Unfollow a user
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
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
  router.delete('/users/:userId/follows/users/:targetUserId', followController.unfollowUser);

  /**
   * @swagger
   * /api/users/{userId}/follows/users/{targetUserId}:
   *   get:
   *     summary: Get user follow status
   *     tags: [Follow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
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
  router.get('/users/:userId/follows/users/:targetUserId', followController.getUserFollowStatus);

  return router;
};

export = initializeFollowRoutes;
