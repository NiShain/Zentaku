import { body, type ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

  body('email').trim().isEmail().withMessage('Must be a valid email').normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),

  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

export const loginValidation: ValidationChain[] = [
  body('email').trim().isEmail().withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation: ValidationChain[] = [
  body('email').trim().isEmail().withMessage('Must be a valid email'),
];

export const resetPasswordValidation: ValidationChain[] = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

export const updateProfileValidation: ValidationChain[] = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Display name must be between 1 and 255 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),

  body('website').optional().isURL().withMessage('Website must be a valid URL'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender value'),

  body('profileVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Invalid profile visibility value'),
];
