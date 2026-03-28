import { body, type ValidationChain } from 'express-validator';

export const updateProfileValidation: ValidationChain[] = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Display name must be between 1 and 255 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Bio must be less than 5000 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),

  body('website')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Website must be a valid URL'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender value'),
];

export const updatePrivacyValidation: ValidationChain[] = [
  body('profileVisibility')
    .exists({ checkFalsy: true })
    .isIn(['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'])
    .withMessage('Invalid profile visibility value'),
];

export const updatePreferencesValidation: ValidationChain[] = [
  body('preferences').optional().isObject().withMessage('preferences must be an object'),
  body('notificationSettings')
    .optional()
    .isObject()
    .withMessage('notificationSettings must be an object'),
];
