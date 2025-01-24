// src/config/config_session.js

// Importing the express-session module for session management in Express
const session = require('express-session'); 

// Load environment variables (if you use dotenv)
require('dotenv').config();

// Get the secret key from environment variables
const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
    console.error('SESSION_SECRET is not set in the environment variables.');
    process.exit(1); // Exit the process if the secret is missing
}

// Function that configures session middleware
const sessionConfig = (app) => {
    app.use(session({
        secret: secretKey,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1800 * 1000, // Session expires after 30 minutes
            domain: process.env.NODE_ENV === 'production' ? 'production-domain.com' : 'localhost', // we can add the real domain when we deploy
            path: '/',
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            httpOnly: true, // Only accessible via HTTP(S), not JavaScript
        }
    }));

    // Middleware for session regeneration every 30 minutes
    app.use((req, res, next) => {
        const interval = 60 * 30 * 1000; // 30 minutes in milliseconds

        if (!req.session.last_regeneration || Date.now() - req.session.last_regeneration >= interval) {
            req.session.regenerate((err) => {
                if (err) {
                    console.error('Session regeneration error:', err);
                    return;
                }
                req.session.last_regeneration = Date.now();
            });
        }
        next();
    });
};

// Function to manually regenerate the session (if needed elsewhere)
const regenerateSession = (req) => {
    req.session.regenerate((err) => {
        if (err) {
            console.error('Session regeneration error:', err);
            return;
        }
        req.session.last_regeneration = Date.now();
    });
};

// Export the session configuration to be used in other files
module.exports = sessionConfig;
