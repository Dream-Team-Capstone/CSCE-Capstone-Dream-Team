// src/Routes/loginRoutes.js

// import required libraries
const express = require('express'); //framework for building the web application
const bcrypt = require('bcryptjs'); // used to hash passwords
const { body, validationResult } = require('express-validator'); // validate and sanitize input data
const router = express.Router(); // used to define routes
const userModel = require('../Models/loginModel'); // model handling user data interactions with the database
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies

// Define login route
router.post('/login', 
    // Validate input
    body('email').isEmail().withMessage('Please enter a valid email.'),
    body('password').isLength({ min: 6 }).withMessage('Please enter your password.'),
    async (req, res) => {
        let errors = validationResult(req).array();

        const { email, password } = req.body;

        if (errors.length >= 2) {
            errors = [{ msg: 'Must fill in ALL fields!' }];
            return res.status(400).render('LoginPage', { errors });
        }
        else if (errors.length > 0){
            return res.status(400).render('LoginPage', { errors });
        }
        
        // Check for existing users
        try {
            const user = await userModel.getUser(email);
            if (!user) {
                errors.push({ msg: 'Invalid email or password.' });
                return res.status(400).render('LoginPage', { errors });
            }

            // Compare the password
            const trimmedPassword = password.trim(); // Trim whitespace
            const storedHash = user.password; // Hash retrieved from DB

            // Compare the provided password with the stored hash
            const isMatch = await bcrypt.compare(trimmedPassword, user.password);

            if (isMatch) {
                // Proceed with authentication
                req.session.userId = user.id;
                req.session.email = user.email;
                req.session.first_name = user.first_name;
                res.redirect('/api/dashboard');
            } else {
                errors.push({ msg: 'Invalid email or password.' });
                return res.status(400).render('LoginPage', { errors });
            }

        } catch (error) {
            console.error("Error logging in:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// export to be used in other files
module.exports = router;