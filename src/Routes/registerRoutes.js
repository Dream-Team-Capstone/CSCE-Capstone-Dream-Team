// src/Routes/registerRoutes.js

// Import required libraries
const express = require('express'); // Framework for building the web application
const bcrypt = require('bcryptjs'); // Used to hash passwords
const { body, validationResult } = require('express-validator'); // Validate and sanitize input data
const router = express.Router(); // Used to define routes
const userModel = require('../Models/registerModel'); // Model handling user data interactions with the database
const saltRounds = 10; // Number of salt rounds for bcrypt

// Define registration route
router.post('/register', 
    // Validate input
    body('first_name').notEmpty().withMessage('First name is required.'),
    body('last_name').notEmpty().withMessage('Last name is required.'),
    body('email').isEmail().withMessage('Invalid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long!'),
    async (req, res) => {
        let errors = validationResult(req).array(); // Checks for validation errors

        const { first_name, last_name, email, password } = req.body;
        const trimmedPassword = password.trim(); // Trim whitespace from password

        // If there are validation errors, render the page with errors
        if (errors.length >= 4) {
            errors = [{ msg: 'Must fill in ALL fields!' }];
            return res.status(400).render('RegisterPage', { errors });
        }
        else if (errors.length > 0){
            return res.status(400).render('RegisterPage', { errors });
        }

        // Check for existing users
        try {
            const existingUser = await userModel.getUserByEmail(email);
            if (existingUser) {
                errors.push({ msg: 'User already exists.' }); // error for existing user
                return res.status(400).render('RegisterPage', { errors });
            }

            // Generate salt
            bcrypt.genSalt(saltRounds, (err, salt) => {
                if (err) {
                    console.error("Error generating salt:", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                
                // Hash the password with the generated salt
                bcrypt.hash(trimmedPassword, salt, async (err, hashedPassword) => {
                    if (err) {
                        console.error("Error hashing password:", err);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    // Create the new user
                    await userModel.createUser(first_name, last_name, email, hashedPassword); 
                    res.redirect('/api/login');
                });
            });

        // Error handling 
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// Export to be used in other files
module.exports = router;