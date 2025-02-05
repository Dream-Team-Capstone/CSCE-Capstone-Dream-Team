// controllers/projectController.js

const { getProgressByUserId } = require('../../src/Models/ProjectTutorialsModel'); // Import the model

// Controller function to render the page with project progress
exports.renderProjectsPage = async (req, res) => {
    try {
        const userId = req.user.id; // Assume user is logged in and user ID is stored in req.user

        // Fetch progress data for the user from the database
        const progressData = await getProgressByUserId(userId);

        // Render the EJS page and pass the progress data
        res.render('projects', {
            user_info: req.user,   // Pass user info to EJS
            projectProgress: progressData
        });
    } catch (error) {
        console.error("Error fetching progress:", error);
        res.status(500).send("Server error while fetching project progress.");
    }
};
