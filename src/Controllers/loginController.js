// src/Controllers/loginController.js

// Import the getUser function from the registerModel file
const { getUser} = require('../../../../src/Models/loginModel');
const bcrypt = require('bcrypt');

// exports asynchronous function loginUser
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const errors = [];

    // Validate input
    if (!email || !password) {
        errors.push("Please fill in all fields!");
        return res.render('LoginPage', { errors, user: req.session.email });
    }

    try {
        // Retrieve the user by email
        const user = await getUser(email);

        //If user not found, return error
        if (!user) {
            errors.push("Invalid email or password.");
            return res.render('LoginPage', { errors, user: req.session.email });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            errors.push("Invalid email or password.");
            return res.render('LoginPage', { errors, user: req.session.email });
        }
        // If login is successful, set session variables
        req.session.userId = user.id; 
        req.session.email = user.email;

        // Redirect to the user's profile or homepage
        res.redirect('/api/dashboard'); // Adjust this based on your application's routing
    } catch (error) {
        console.error("Error logging in:", error);
        errors.push("Internal server error. Please try again later.");
        res.render('LoginPage', { errors, user: req.session.email });
    }
};