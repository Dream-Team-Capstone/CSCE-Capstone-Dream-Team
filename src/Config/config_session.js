// src/config/config_session.js

// imports the express-session module used to manage session data in an Express application
const session = require('express-session'); 

// Generate a secret key or use an environment variable
const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
    console.error('SESSION_SECRET is not set in the environment variables.');
    process.exit(1); // Exit if the session secret is not set
}

// function that configures session middleware
const sessionConfig = (app) => {
    app.use(session({
        secret: secretKey,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1800 * 1000, // 30 minutes in milliseconds
            domain: 'localhost',
            path: '/',
            secure: false, // false for development but should be set to true for deployment
            httpOnly: true,
        }
    }));

    // Middleware for session regeneration based on last regeneration time
    app.use((req, res, next) => {
        const interval = 60 * 30 * 1000; // 30 minutes in milliseconds
        if (!req.session.last_regeneration) {
            regenerateSession(req);
        } else {
            if (Date.now() - req.session.last_regeneration >= interval) {
                regenerateSession(req);
            }
        }
        next();
    });
};

// Function to regenerate the session
const regenerateSession = (req) => {
    req.session.regenerate((err) => {
        if (err) {
            console.error('Session regeneration error:', err);
            return;
        }
        req.session.last_regeneration = Date.now();
    });
};

// exported to be used in other files
module.exports = sessionConfig;