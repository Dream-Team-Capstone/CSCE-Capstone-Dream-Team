// src/Routes/loginRoutes.js

// import required libraries
const express = require('express'); //framework for building the web application
const bcrypt = require('bcrypt'); // used to hash passwords
const { body, validationResult } = require('express-validator'); // validate and sanitize input data
const router = express.Router(); // used to define routes
const userModel = require('../Models/loginModel'); // model handling user data interactions with the database
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies 

// Define login route
router.post('/login', 
    // Validate input
    body('email').isEmail().withMessage('Invalid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    // asynchronous functions to define login route
    async (req, res) => {
        console.log("Login attempt"); // Debugging
        const errors = validationResult(req); // checks for validation errors
        if (!errors.isEmpty()) {
            return res.status(400).render('LoginPage', { errors: errors.array() });
        }

        const { email, password } = req.body;
        console.log("Provided Email:", email); // Log provided email // debug
        console.log("Provided Password:", password); // Log provided password // debug
        // checks for existing users
        try {
            const user = await userModel.getUser(email);
            console.log("Fetched user:", user); //debug
            if (!user) {
                return res.status(400).render('LoginPage', { errors: [{ msg: 'Invalid email or password.' }] });
            }

            const storedHash = '$2b$12$.308Tt.Fwj4Yj7w7SSFh1eNSxeGYLrid1zTKjjA2ozbMigy0ZOsCy'; // The hash from your query result

            const match1 = await bcrypt.compare('123456', storedHash);
            console.log("Manual Password Match:", match1);
            
            // Compare the password
            const match = await bcrypt.compare(password, user.password);
            console.log("Password Match:", match); // debug

            if (!match) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }
            // Set session variables
            req.session.id = user.id;
            req.session.email = user.email;
            res.redirect('/api/dashboard');
            res.status(200).json({ message: 'Login successful.' }); // DEBUGGING

        // error handling 
        } catch (error) {
            console.error("Error logging in:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// export to be used in other files
module.exports = router;