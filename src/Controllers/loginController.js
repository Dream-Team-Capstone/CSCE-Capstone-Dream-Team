// src/Controllers/loginController.js

// Import the getUser function from the registerModel file
const { getUser} = require('../Models/loginModel');

// exports asynchronous function loginUser
exports.loginUser = async (req, res) => {
    console.log("Login function triggered");
    const { email, password } = req.body;
    const errors = [];

    // Validate input
    if (!email || !password) {
        errors.push("Please fill in all fields!");
        return res.render('LoginPage', { errors });
    }

    try {
        // Retrieve the user by email
        const user = await getUser(email);
        console.log('Fetched user:', user);

        //If user not found, return error
        if (!user) {
            errors.push("Invalid email or password.");
            return res.render('LoginPage', { errors });
        }

        // Compare provided password with stored hashed password
        console.log("Provided Password:", password);
        console.log("Stored Password Hash:", user.password);
        const match = await bcrypt.compare(password, user.password, 12);
        console.log("Password Match:", match);
        if (!match) {
            errors.push("Invalid email or password.");
            return res.render('LoginPage', { errors });
        }
        // If login is successful, set session variables
        req.session.id = id; 
        req.session.email = user.email;

        // Redirect to the user's profile or homepage
        res.redirect('/api/dashboard'); // Adjust this based on your application's routing
    } catch (error) {
        console.error("Error logging in:", error);
        errors.push("Internal server error. Please try again later.");
        res.render('LoginPage', { errors });
    }
};