// src/Routes/registerRoutes.js

// import required libraries
const express = require('express'); //framework for building the web application
const bcrypt = require('bcrypt'); // used to hash passwords
const { body, validationResult } = require('express-validator'); // validate and sanitize input data
const router = express.Router(); // used to define routes
const userModel = require('../Models/registerModel'); // model handling user data interactions with the database
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies 

// Define registration route
router.post('/register', 
    // Validate input
    body('first_name').notEmpty().withMessage('First name is required.'),
    body('last_name').notEmpty().withMessage('Last name is required.'),
    body('email').isEmail().withMessage('Invalid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    // asynchronous functions to define registration route
    async (req, res) => {
        const errors = validationResult(req); // checks for validation errors
        if (!errors.isEmpty()) {
            return res.status(400).render('RegisterPage', { errors: errors.array() });
        }

        const { first_name, last_name, email, password } = req.body;
        // checks for existing users
        try {
            const existingUser = await userModel.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists.' });
            }
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create the new user
            await userModel.createUser(first_name, last_name, email, hashedPassword);
            res.redirect('/api/login');
            // res.status(201).json({ message: 'User created successfully.' }); // DEBUGGING

        // error handling 
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// export to be used in other files
module.exports = router;
