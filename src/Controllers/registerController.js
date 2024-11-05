/*
Handles the user registration process, validating input data and checking for existing users.
*/

// src/Controllers/registerController.js

// Import the getUserByName, getUserByEmail, and createUser functions from the registerModel file
const { getUserByName, 
    getUserByEmail, 
    createUser } = require('../../../../src/Models/registerModel');

// exports asynchronous function signupUser
exports.signupUser = async (req, res) => {
// deconstructs the body from incoming request
const { first_name, 
        last_name, 
        email, 
        password } = req.body;
const errors = []; // initialize errors array
const signupData = { first_name, last_name, email }; // used to store user info

// if any field is missing an error is displayed
if (!first_name || !last_name || !email || !password) {
    errors.push("Please fill in all fields!");
}
// validate the email format
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email address.");
}

// check for existing users
const emailExists = await getUserByEmail(email);
if (emailExists) {
    errors.push("Email already registered.");
}

// if there are any errors, render the RegisterPage with the errors
if (errors.length > 0) {
    return res.render('RegisterPage', { signupData, errors });
}

await createUser(first_name, last_name, email, password);
res.redirect('/login');
};