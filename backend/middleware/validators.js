const { body, validationResult } = require('express-validator');

exports.validateSignup = [
  body('firstname').notEmpty().withMessage('First name is required'),
  body('lastname').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('userid')
    .isLength({ min: 4 })
    .withMessage('User ID must be at least 4 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

exports.validateLogin = [
  body('userid').notEmpty().withMessage('User ID is required'),
  body('password').notEmpty().withMessage('Password is required')
];

