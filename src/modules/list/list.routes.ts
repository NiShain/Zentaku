/**
 * List Routes
 *
 * Endpoint declarations for the List Feature
 */

import express, { type Router } from 'express';
import type { Container } from '../../config/container';
import { authenticate } from '../../middlewares/authenticate';
import type ListController from './controllers/list.controller';
import {
  addMemberValidation,
  createListValidation,
  inviteMemberValidation,
  listIdParamValidation,
  respondToRequestValidation,
  updateListValidation,
  updateMemberPermissionValidation,
  updateThemeValidation,
  getUserListsValidation,
  searchListValidation,
  requestJoinValidation,
  requestEditValidation,
} from './validators/list.validators';

const initializeListRoutes = (container: Container): Router => {
  const router = express.Router();
  const listController = container.resolve<ListController>('listController');

  // ==================== PHASE 1: CRUD ====================

  /**
   * @swagger
   * /api/list/create:
   *   post:
   *     summary: Create a new custom list
   *     description: Create a new anime list owned by the authenticated user
   *     tags: [List]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateListRequest'
   *     responses:
   *       201:
   *         description: List created successfully
   *       400:
   *         description: Validation failed
   *       401:
   *         description: Unauthorized
   */
  router.post('/create', authenticate, createListValidation, listController.createList);

  /**
   * @swagger
   * /api/list/user:
   *   get:
   *     summary: Get user's lists
   *     description: Get all public/private lists by username
   *     tags: [List]
   *     parameters:
   *       - in: query
   *         name: username
   *         required: true
   *         schema:
   *           type: string
   *         example: john_doe
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lists retrieved successfully
   *       400:
   *         description: Validation failed
   */
  router.get('/user', getUserListsValidation, listController.getUserLists);

  /**
   * @swagger
   * /api/list/{listId}:
   *   get:
   *     summary: Get list detail
   *     description: Get detailed information about a specific list including anime items
   *     tags: [List]
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: integer
   *         example: 1
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List detail retrieved successfully
   *       403:
   *         description: Access denied (private list)
   *       404:
   *         description: List not found
   */
  router.get('/:listId', listIdParamValidation, listController.getListDetail);

  /**
   * @swagger
   * /api/list/anime/{listId}:
   *   get:
   *     summary: Get anime items in list
   *     description: Get all anime items in a specific list
   *     tags: [List]
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: integer
   *         example: 1
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Anime items retrieved successfully
   *       404:
   *         description: List not found
   */
  router.get('/anime/:listId', listIdParamValidation, listController.getListAnimes);

  /**
   * @swagger
   * /api/list/{listId}/update:
   *   put:
   *     summary: Update list details
   *     description: Update name, description, privacy, or banner image of a list
   *     tags: [List]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateListRequest'
   *     responses:
   *       200:
   *         description: List updated successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Not list owner
   *       404:
   *         description: List not found
   */
  router.put(
    '/:listId/update',
    authenticate,
    listIdParamValidation,
    updateListValidation,
    listController.updateList
  );

  /**
   * @swagger
   * /api/list/{listId}/delete:
   *   delete:
   *     summary: Delete a list
   *     description: Permanently delete a custom list (soft delete)
   *     tags: [List]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: integer
   *         example: 1
   *     responses:
   *       200:
   *         description: List deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Not list owner
   *       404:
   *         description: List not found
   */
  router.delete('/:listId/delete', authenticate, listIdParamValidation, listController.deleteList);

  // ==================== PHASE 2: MEMBER MANAGEMENT ====================

  /**
   * @swagger
   * /api/list/member/{listId}/list:
   *   get:
   *     summary: Get list members
   *     tags: [List Members]
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: integer
   *         example: 1
   *     security:
   *       - bearerAuth: []
   */
  router.get('/member/:listId/list', listIdParamValidation, listController.listMembers);

  /**
   * @swagger
   * /api/list/member/{listId}/add:
   *   post:
   *     summary: Add member to list
   *     tags: [List Members]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: integer
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - permission
   *             properties:
   *               username:
   *                 type: string
   *                 example: jane_doe
   *               permission:
   *                 type: string
   *                 enum: [EDITOR, VIEWER]
   *                 example: VIEWER
   */
  router.post(
    '/member/:listId/add',
    authenticate,
    listIdParamValidation,
    addMemberValidation,
    listController.addMember
  );

  /**
   * @swagger
   * /api/list/member/{listId}/permission:
   *   put:
   *     summary: Update member permission
   *     tags: [List Members]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: integer
   *         example: 1
   */
  router.put(
    '/member/:listId/permission',
    authenticate,
    listIdParamValidation,
    updateMemberPermissionValidation,
    listController.updateMemberPermission
  );

  /**
   * @swagger
   * /api/list/member/{listId}/remove:
   *   delete:
   *     summary: Remove member from list
   *     tags: [List Members]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: username
   *         required: true
   *         schema:
   *           type: string
   *         example: jane_doe
   */
  router.delete(
    '/member/:listId/remove',
    authenticate,
    listIdParamValidation,
    listController.removeMember
  );

  // ==================== PHASE 3: INVITES & REQUESTS ====================

  /**
   * @swagger
   * /api/list/{listId}/invite:
   *   post:
   *     summary: Invite member to list
   *     tags: [List Invitations]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - permission
   *             properties:
   *               username:
   *                 type: string
   *                 example: jane_doe
   *               permission:
   *                 type: string
   *                 enum: [EDITOR, VIEWER]
   *                 example: EDITOR
   *               message:
   *                 type: string
   *                 maxLength: 500
   */
  router.post(
    '/:listId/invite',
    authenticate,
    listIdParamValidation,
    inviteMemberValidation,
    listController.inviteMember
  );

  /**
   * @swagger
   * /api/list/{listId}/request-join:
   *   post:
   *     summary: Request to join a private list
   *     tags: [List Requests]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ListRequestBody'
   */
  router.post(
    '/:listId/request-join',
    authenticate,
    listIdParamValidation,
    requestJoinValidation,
    listController.requestJoin
  );

  /**
   * @swagger
   * /api/list/{listId}/request-edit:
   *   post:
   *     summary: Request editor role for a list
   *     tags: [List Requests]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ListRequestBody'
   */
  router.post(
    '/:listId/request-edit',
    authenticate,
    listIdParamValidation,
    requestEditValidation,
    listController.requestEdit
  );

  /**
   * @swagger
   * /api/list/{listId}/requests:
   *   get:
   *     summary: Get pending list requests
   *     tags: [List Requests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: integer
   *         example: 1
   */
  router.get(
    '/:listId/requests',
    authenticate,
    listIdParamValidation,
    listController.getListRequests
  );

  /**
   * @swagger
   * /api/list/{listId}/join-requests/{requestId}/respond:
   *   post:
   *     summary: Respond to join request
   *     tags: [List Requests]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RespondToRequestBody'
   */
  router.post(
    '/:listId/join-requests/:requestId/respond',
    authenticate,
    respondToRequestValidation,
    listController.respondToRequest
  );

  /**
   * @swagger
   * /api/list/{listId}/edit-requests/{requestId}/respond:
   *   post:
   *     summary: Respond to edit request
   *     tags: [List Requests]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RespondToRequestBody'
   */
  router.post(
    '/:listId/edit-requests/:requestId/respond',
    authenticate,
    respondToRequestValidation,
    listController.respondToRequest
  );

  // ==================== PHASE 4: THEME & LIKES ====================

  /**
   * @swagger
   * /api/list/{listId}/theme:
   *   put:
   *     summary: Update list theme
   *     tags: [List Theme]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - themeKey
   *             properties:
   *               themeKey:
   *                 type: string
   *                 example: summer-vibes
   *               themeColor:
   *                 type: string
   *                 example: '#FFAA00'
   */
  router.put(
    '/:listId/theme',
    authenticate,
    listIdParamValidation,
    updateThemeValidation,
    listController.updateTheme
  );

  /**
   * @swagger
   * /api/list/{listId}/like:
   *   post:
   *     summary: Toggle like on a list
   *     tags: [List Likes]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/:listId/like', authenticate, listIdParamValidation, listController.toggleLike);

  /**
   * @swagger
   * /api/list/{listId}/like/status:
   *   get:
   *     summary: Get like status
   *     tags: [List Likes]
   *     security:
   *       - bearerAuth: []
   */
  router.get(
    '/:listId/like/status',
    authenticate,
    listIdParamValidation,
    listController.getLikeStatus
  );

  // ==================== PHASE 5: SEARCH ====================

  /**
   * @swagger
   * /api/list/search:
   *   post:
   *     summary: Search lists
   *     tags: [List Search]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - query
   *             properties:
   *               query:
   *                 type: string
   *                 example: action
   *               sortBy:
   *                 type: string
   *                 enum: [RECENT, MOST_LIKED, NAME]
   *               page:
   *                 type: integer
   *                 example: 1
   *               limit:
   *                 type: integer
   *                 example: 20
   *               isPublicOnly:
   *                 type: boolean
   */
  router.post('/search', searchListValidation, listController.searchLists);

  return router;
};

export = initializeListRoutes;
