import express, { type Router } from 'express';
import type { Container } from '../../config/container';
import { authenticate } from '../../middlewares/authenticate';
import { avatarUpload, bannerUpload } from '../../middlewares/upload';
import type UserController from './controllers/user.controller';
import {
  updatePreferencesValidation,
  updatePrivacyValidation,
  updateProfileValidation,
} from './validators/user.validators';

const initializeUserRoutes = (container: Container): Router => {
  const router = express.Router();
  const userController = container.resolve<UserController>('userController');

  router.use(authenticate);

  /**
   * @swagger
   * /api/user/me:
   *   get:
   *     summary: Get current user profile
   *     description: Retrieve the profile information of the currently authenticated user
   *     tags: [User]
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         required: true
   *         schema:
   *           type: string
   *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *         description: Bearer access token of the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     email:
   *                       type: string
   *                       example: test@example.com
   *                     username:
   *                       type: string
   *                       example: testuser
   *                     displayName:
   *                       type: string
   *                       example: Test User
   *                     bio:
   *                       type: string
   *                       nullable: true
   *                     location:
   *                       type: string
   *                       nullable: true
   *                     website:
   *                       type: string
   *                       nullable: true
   *                     avatar:
   *                       type: string
   *                       nullable: true
   *                     banner:
   *                       type: string
   *                       nullable: true
   *                     gender:
   *                       type: string
   *                       enum: [male, female, other, prefer_not_to_say]
   *                       nullable: true
   *       401:
   *         description: Unauthorized - missing or invalid token
   */
  router.get('/me', userController.getProfile);

  /**
   * @swagger
   * /api/user/me:
   *   patch:
   *     summary: Update user profile
   *     description: Update profile information like display name, bio, location, website, and gender
   *     tags: [User]
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         required: true
   *         schema:
   *           type: string
   *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *         description: Bearer access token of the authenticated user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               displayName:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 255
   *                 example: John Doe
   *               bio:
   *                 type: string
   *                 maxLength: 5000
   *                 example: I love anime and manga
   *               location:
   *                 type: string
   *                 maxLength: 100
   *                 example: Tokyo, Japan
   *               website:
   *                 type: string
   *                 format: uri
   *                 example: https://example.com
   *               gender:
   *                 type: string
   *                 enum: [male, female, other, prefer_not_to_say]
   *                 example: male
   *               birthday:
   *                 type: string
   *                 format: date
   *                 example: "1990-01-15"
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  router.patch('/me', updateProfileValidation, userController.updateProfile);

  /**
   * @swagger
   * /api/user/me/preferences:
   *   patch:
   *     summary: Update user preferences
   *     description: Update theme, language, timezone, and notification settings
   *     tags: [User]
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         required: true
   *         schema:
   *           type: string
   *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *         description: Bearer access token of the authenticated user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               preferences:
   *                 type: object
   *                 properties:
   *                   theme:
   *                     type: string
   *                     enum: [light, dark, auto]
   *                     example: dark
   *                   language:
   *                     type: string
   *                     example: vi
   *                   timezone:
   *                     type: string
   *                     example: Asia/Ho_Chi_Minh
   *                   titleLanguage:
   *                     type: string
   *                     enum: [romaji, english, native]
   *                     example: romaji
   *                   adultContent:
   *                     type: boolean
   *                     example: false
   *               notificationSettings:
   *                 type: object
   *                 properties:
   *                   email:
   *                     type: boolean
   *                     example: true
   *                   push:
   *                     type: boolean
   *                     example: true
   *                   follows:
   *                     type: boolean
   *                     example: true
   *                   comments:
   *                     type: boolean
   *                     example: true
   *                   listUpdates:
   *                     type: boolean
   *                     example: false
   *     responses:
   *       200:
   *         description: Preferences updated successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  router.patch('/me/preferences', updatePreferencesValidation, userController.updatePreferences);

  /**
   * @swagger
   * /api/user/me/privacy:
   *   patch:
   *     summary: Update user privacy settings
   *     description: Set profile visibility to PUBLIC, FRIENDS_ONLY, or PRIVATE
   *     tags: [User]
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         required: true
   *         schema:
   *           type: string
   *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *         description: Bearer access token of the authenticated user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - profileVisibility
   *             properties:
   *               profileVisibility:
   *                 type: string
   *                 enum: [PUBLIC, FRIENDS_ONLY, PRIVATE]
   *                 example: FRIENDS_ONLY
   *                 description: Profile visibility level
   *     responses:
   *       200:
   *         description: Privacy settings updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     profileVisibility:
   *                       type: string
   *                       example: friends
   *       400:
   *         description: Validation error - invalid profileVisibility value
   *       401:
   *         description: Unauthorized
   */
  router.patch('/me/privacy', updatePrivacyValidation, userController.updatePrivacy);

  /**
   * @swagger
   * /api/user/me/avatar:
   *   post:
   *     summary: Upload user avatar
   *     description: Upload a profile avatar image (jpg, png, webp). Max size 2MB
   *     tags: [User]
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         required: true
   *         schema:
   *           type: string
   *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *         description: Bearer access token of the authenticated user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: Avatar image file (jpg, png, webp). Max 2MB
   *     responses:
   *       200:
   *         description: Avatar uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     avatar:
   *                       type: string
   *                       example: /uploads/users/avatar/1711603456789-123456789.jpg
   *       400:
   *         description: File missing, invalid type, or size exceeds 2MB
   *       401:
   *         description: Unauthorized
   */
  router.post('/me/avatar', avatarUpload.single('file'), userController.uploadAvatar);

  /**
   * @swagger
   * /api/user/me/banner:
   *   post:
   *     summary: Upload user banner
   *     description: Upload a profile banner image (jpg, png, webp). Max size 5MB
   *     tags: [User]
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         required: true
   *         schema:
   *           type: string
   *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *         description: Bearer access token of the authenticated user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: Banner image file (jpg, png, webp). Max 5MB
   *     responses:
   *       200:
   *         description: Banner uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     banner:
   *                       type: string
   *                       example: /uploads/users/banner/1711603456789-987654321.png
   *       400:
   *         description: File missing, invalid type, or size exceeds 5MB
   *       401:
   *         description: Unauthorized
   */
  router.post('/me/banner', bannerUpload.single('file'), userController.uploadBanner);

  return router;
};

export = initializeUserRoutes;
