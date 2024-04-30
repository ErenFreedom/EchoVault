const { check, validationResult } = require('express-validator');
const User = require('../models/UserModel'); 
const userValidations = [
  check('firstName').trim().not().isEmpty().withMessage('First name is required'),
  check('lastName').trim().not().isEmpty().withMessage('Last name is required'),
  check('age').isInt({ min: 1 }).withMessage('Valid age is required'),
  check('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  check('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  check('email').normalizeEmail().isEmail().withMessage('Must be a valid email address'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('recovery_email').normalizeEmail().isEmail().withMessage('Must be a valid recovery email address'),
];

exports.validateDummyRegistration = [
  ...userValidations,
  check('premiumUsername').trim().not().isEmpty().withMessage('Premium username is required for linking to a premium account')
    .custom(async (premiumUsername) => {
      const premiumUser = await User.findOne({ username: premiumUsername, isPremium: true });
      if (!premiumUser) {
        throw new Error('Premium username not found or not a premium account.');
      }
    }),
];

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


exports.validateLogin = [
    check('identifier').trim().not().isEmpty().withMessage('Email/Username is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

exports.runLoginValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
