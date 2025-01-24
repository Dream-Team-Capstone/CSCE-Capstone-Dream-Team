const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const deleteController = require('../Controllers/deleteController');

router.post(
    '/api/delete',
    // Validate email and password fields
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    async (req, res) => {
        console.log('Delete route accessed');

        // Extract email and password from the request
        const { email, password } = req.body;

        // Check for validation errors
        let errors = validationResult(req).array();

        // Ensure user is logged in
        if (!req.session || !req.session.user) {
            errors.push({ msg: 'You must be logged in to delete your account.' });
        }

        // Compare session credentials with input
        if (req.session && req.session.user) {
            const loggedInUserEmail = req.session.user.email;
            const loggedInUserPassword = req.session.user.password; // Assuming password is stored (hashed)

            if (loggedInUserEmail !== email) {
                errors.push({ msg: 'Email does not match the logged-in user.' });
            }
            // Add further validation for password match if applicable
        }

        // Handle errors
        if (errors.length > 0) {
            return res.status(400).render('DeleteAccountPage', { errors });
        }

        // Proceed with account deletion
        await deleteController.deleteAccount(req, res);
    }
);

module.exports = router;
