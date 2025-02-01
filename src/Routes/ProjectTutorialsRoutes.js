// src/Routes/ProjectTutorialsRoutes.js

const express = require('express');
const router = express.Router();
const tutorialsModel = require('../Models/ProjectTutorialsModel'); // !! model handling user data interactions with the database NOT YET CREATED !!
const tutorialsController = require('../Controllers/ProjectTutorialsController');

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/api/login');
}

// Base tutorial route - list all available tutorials
router.get('/project-tutorials', ensureAuthenticated, (req, res) => {
    const user = req.session.first_name;
    res.render('ProjectsPage', { user });
});

// Specific Hello World tutorial route
router.get('/project-tutorials/hello-world', ensureAuthenticated, (req, res) => {
    // Render PlayPage with tutorial mode enabled
    res.render('PlayPage', { 
        tutorialMode: true,
        tutorialId: 'hello-world',
        user: req.session.first_name
    });
});

// Start specific tutorial
router.post('/project-tutorials/:tutorialId/start', ensureAuthenticated, (req, res) => {
    // Initialize tutorial state
    // This will be handled by the controller once created
});

// Validate tutorial step
router.post('/project-tutorials/:tutorialId/validate', ensureAuthenticated, (req, res) => {
    // Validate current step
    // This will be handled by the controller once created
});

module.exports = router;

