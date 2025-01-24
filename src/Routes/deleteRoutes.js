const express = require('express');
const { validationResult } = require('express-validator');
const { body } = require('express-validator');
const router = express.Router();
const deleteController = require('../Controllers/deleteController');

router.post(
  '/api/delete',
  [
      body('email').isEmail().withMessage('Enter a valid email address.'),
      body('password')
          .isLength({ min: 6 })
          .withMessage('Password must be at least 6 characters long.')
  ],
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          console.log('Validation errors:', errors.array());
          return res.render('DeleteAccountPage', { errors: errors.array() });
      }
      next();
  },
  deleteController.deleteAccount
);

module.exports = router;

