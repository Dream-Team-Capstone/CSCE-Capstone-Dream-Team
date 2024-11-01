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
    body('email').isEmail().withMessage('Invalid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('LoginPage', { errors: errors.array() });
        }

        const { email, password } = req.body;
        
        // Check for existing users
        try {
            const user = await userModel.getUser(email);
            if (!user) {
                return res.status(400).render('LoginPage', { errors: [{ msg: 'Invalid email or password.' }] });
            }

            // Compare the password
            const trimmedPassword = password.trim(); // Trim whitespace
            const storedHash = user.password; // Hash retrieved from DB

            // Compare the provided password with the stored hash
            const isMatch = await bcrypt.compare(trimmedPassword, user.password);

            if (isMatch) {
                // Proceed with authentication
                req.session.id = user.id;
                req.session.email = user.email;
                res.redirect('/api/dashboard');
            } else {
                return res.status(400).json({ error: 'Invalid email or password.' }); 
            }

        } catch (error) {
            console.error("Error logging in:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);


// export to be used in other files
module.exports = router;