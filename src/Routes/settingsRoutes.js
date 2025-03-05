const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Route to render settings page
router.get('/settings', (req, res) => {
    res.render('SettingsPage', { 
        user: req.session.user ? req.session.user.first_name : null
    });
});

// Route to save user settings
router.post('/save-settings', isAuthenticated, async (req, res) => {
    try {
        const { darkMode, highContrast, fontSize } = req.body;
        const userId = req.session.user.id;
        
        // Check if user already has settings
        const [existingSettings] = await db.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [userId]
        );
        
        if (existingSettings.length > 0) {
            // Update existing settings
            await db.query(
                'UPDATE user_settings SET dark_mode = ?, high_contrast = ?, font_size = ? WHERE user_id = ?',
                [darkMode, highContrast, fontSize, userId]
            );
        } else {
            // Insert new settings
            await db.query(
                'INSERT INTO user_settings (user_id, dark_mode, high_contrast, font_size) VALUES (?, ?, ?, ?)',
                [userId, darkMode, highContrast, fontSize]
            );
        }
        
        res.status(200).json({ message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

module.exports = router; 