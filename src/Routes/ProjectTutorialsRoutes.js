// src/Routes/ProjectTutorialsRoutes.js

const express = require('express');
const router = express.Router();
const tutorialsModel = require('../Models/ProjectTutorialsModel'); 
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
        
        // Fetch progress data
        const result = await pool.query(
            `SELECT project1_progress, project2_progress, project3_progress 
             FROM user_progress 
             WHERE user_id = $1`,
            [userId]
        );

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

// Save tutorial progress
router.post('/project-tutorials/save', ensureAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const { tutorialId, currentStep, workspaceState } = req.body;
    
    console.log('Received save request:', {
        userId,
        tutorialId,
        currentStep,
        hasWorkspaceState: !!workspaceState
    });

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        // Map tutorial IDs to project numbers
        const projectMapping = {
            'hello-world': 'project1_progress',
            'loops-intro': 'project2_progress',
            'variables-basic': 'project3_progress'
        };

        const projectField = projectMapping[tutorialId];
        if (!projectField) {
            return res.status(400).json({ error: 'Invalid tutorial ID' });
        }

        // Calculate progress percentage
        const totalSteps = 6;
        const progressPercentage = Math.round((currentStep / totalSteps) * 100);

        // Validate progress percentage
        if (progressPercentage < 0 || progressPercentage > 100) {
            console.error('Invalid progress value:', progressPercentage);
            return res.status(400).json({ error: 'Progress percentage must be between 0 and 100.' });
        }

        // Create update object with all projects initialized to 0
        const updateData = {
            project1_progress: 0,
            project2_progress: 0,
            project3_progress: 0
        };
        updateData[projectField] = progressPercentage;
        // Log the workspace state before saving
        console.log('Workspace state being saved:', {
            hasState: !!workspaceState,
            stateType: typeof workspaceState
        });

        const result = await pool.query(
            `INSERT INTO user_progress 
                (user_id, ${projectField}, workspace_state)
             VALUES ($1, $2, $3::jsonb)
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                ${projectField} = GREATEST(user_progress.${projectField}, $2),
                workspace_state = $3::jsonb,
                last_updated = now()
             RETURNING *`,
            [userId, progressPercentage, workspaceState]
        );

        console.log('Save successful:', {
            userId,
            progress: result.rows[0][projectField],
            hasWorkspaceState: !!result.rows[0].workspace_state,
            savedState: result.rows[0].workspace_state // Log the saved state
        });

        res.json({ 
            status: 'success', 
            progress: result.rows[0],
            message: 'Progress saved successfully'
        });
    } catch (err) {
        console.error('Database error while saving progress:', err);
        res.status(500).json({ 
            error: 'Failed to save progress',
            details: err.message 
        });
    }
});

// Fetch progress for all projects
router.get('/project-tutorials/fetch', ensureAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    try {
        const result = await pool.query(
            `SELECT project1_progress, project2_progress, project3_progress, workspace_state, last_updated 
             FROM user_progress 
             WHERE user_id = $1`,
            [userId]
        );

        console.log('Fetch result:', result.rows[0]); // Debug log

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Progress not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching progress:', err);
        res.status(500).json({ error: 'Failed to fetch progress.' });
    }
});

module.exports = router;

