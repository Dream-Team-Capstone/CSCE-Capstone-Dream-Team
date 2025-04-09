// src/Routes/loginRoutes.js

// import required libraries
const express = require("express"); //framework for building the web application
const bcrypt = require("bcryptjs"); // used to hash passwords
const { body, validationResult } = require("express-validator"); // validate and sanitize input data
const router = express.Router(); // used to define routes
const userModel = require("../Models/loginModel"); // model handling user data interactions with the database
const bodyParser = require("body-parser"); // Middleware to parse incoming request bodies
const { pool } = require("../Config/dbh"); // PostgreSQL client for database interactions

// Define login route
router.post(
  "/login",
  // Validate input
  body("email").isEmail().withMessage("Please enter a valid email."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Please enter your password."),
  async (req, res) => {
    // Check if user is already authenticated
    if (req.session.userId) {
      return res.redirect("/api/dashboard");
    }

    let errors = validationResult(req).array();

    const { email, password } = req.body;

    if (errors.length >= 2) {
      errors = [{ msg: "Must fill in ALL fields!" }];
      return res.status(400).render("LoginPage", { errors });
    } else if (errors.length > 0) {
      return res.status(400).render("LoginPage", { errors });
    }

    // Check for existing users
    try {
      const user = await userModel.getUser(email);
      if (!user) {
        errors.push({ msg: "Invalid email or password." });
        return res.status(400).render("LoginPage", { errors });
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
        req.session.last_name = user.last_name;
        req.session.password = user.password;

        // Load user settings
        const settingsResult = await pool.query(
          "SELECT dark_mode, high_contrast, font_size FROM user_settings WHERE user_id = $1",
          [user.id]
        );

        if (settingsResult.rows.length > 0) {
          // Store settings in session
          req.session.userSettings = {
            darkMode: settingsResult.rows[0].dark_mode,
            highContrast: settingsResult.rows[0].high_contrast,
            fontSize: settingsResult.rows[0].font_size,
          };
        }

        // Add delay before redirect
        setTimeout(() => {
          res.redirect("/api/dashboard");
        }, 2000); // 2 second delay
      } else {
        errors.push({ msg: "Invalid email or password." });
        return res.status(400).render("LoginPage", { errors });
      }
    } catch (error) {
      console.error("Login error:", error);
      errors.push({ msg: "Login failed. Please try again." });
      res.status(500).render("LoginPage", { errors });
    }
  }
);

// export to be used in other files
module.exports = router;
