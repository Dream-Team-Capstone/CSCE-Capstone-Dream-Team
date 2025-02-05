// src/Routes/ProjectTutorialsRoutes.js

const express = require('express');
const router = express.Router();
const tutorialsModel = require('../Models/ProjectTutorialsModel'); // !! model handling user data interactions with the database NOT YET CREATED !!
const tutorialsController = require('../Controllers/ProjectTutorialsController');
const { pool } = require('../Config/dbh');

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/api/login');
}

// Base tutorial route - list all available tutorials
router.get('/project-tutorials', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.session.first_name;
        const userId = req.session.userId;
        
        // Add console.log to debug
        // console.log('Attempting to fetch progress for user:', userId); // DEBUG
        
        // Fetch progress data
        const result = await pool.query(
            `SELECT project1_progress, project2_progress, project3_progress 
             FROM user_progress 
             WHERE user_id = $1`,
            [userId]
        );

        // Add console.log to see query result
        //console.log('Query result:', result.rows); // DEBUG

        // Set default progress if no data exists
        const user_progress = result.rows[0] || {
            project1_progress: 0,
            project2_progress: 0,
            project3_progress: 0
        };

        res.render('ProjectsPage', { user, user_progress });
    } catch (err) {
        // Improve error logging
        console.error('Detailed error fetching progress:', err);
        res.status(500).send('Server error while fetching progress');
    }
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

// Save or update progress for all projects
router.post('/project-tutorials/save', ensureAuthenticated, async (req, res) => {
    const { project1_progress, project2_progress, project3_progress } = req.body;
    const userId = req.session.userId;

    if (
        project1_progress < 0 || project1_progress > 100 ||
        project2_progress < 0 || project2_progress > 100 ||
        project3_progress < 0 || project3_progress > 100
    ) {
        return res.status(400).json({ error: 'Progress percentage must be between 0 and 100 for all projects.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO user_progress (user_id, project1_progress, project2_progress, project3_progress)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id)
             DO UPDATE SET project1_progress = $2, project2_progress = $3, project3_progress = $4, last_updated = now()
             RETURNING *`,
            [userId, project1_progress, project2_progress, project3_progress]
        );
        res.json({ status: 'success', progress: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save progress.' });
    }
});

// Fetch progress for all projects
router.get('/project-tutorials/fetch', ensureAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    try {
        const result = await pool.query(
            `SELECT project1_progress, project2_progress, project3_progress, last_updated FROM user_progress WHERE user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Progress not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch progress.' });
    }
});

module.exports = router;

