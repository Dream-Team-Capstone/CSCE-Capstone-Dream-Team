const { pool } = require('../Config/dbh');

/**
 * Save user settings to the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveSettings = async (req, res) => {
    try {
        const { darkMode, highContrast, fontSize } = req.body;
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'You must be logged in to save settings' });
        }
        
        // Check if user already has settings
        const existingSettings = await pool.query(
            'SELECT * FROM user_settings WHERE user_id = $1',
            [userId]
        );
        
        if (existingSettings.rows.length > 0) {
            // Update existing settings
            await pool.query(
                'UPDATE user_settings SET dark_mode = $1, high_contrast = $2, font_size = $3 WHERE user_id = $4',
                [darkMode, highContrast, fontSize, userId]
            );
        } else {
            // Insert new settings
            await pool.query(
                'INSERT INTO user_settings (user_id, dark_mode, high_contrast, font_size) VALUES ($1, $2, $3, $4)',
                [userId, darkMode, highContrast, fontSize]
            );
        }
        
        res.status(200).json({ message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
};

/**
 * Fetch user settings from the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchSettings = async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'You must be logged in to fetch settings' });
        }
        
        // Get user settings
        const result = await pool.query(
            'SELECT dark_mode, high_contrast, font_size FROM user_settings WHERE user_id = $1',
            [userId]
        );
        
        if (result.rows.length > 0) {
            // Return settings
            res.status(200).json({
                darkMode: result.rows[0].dark_mode,
                highContrast: result.rows[0].high_contrast,
                fontSize: result.rows[0].font_size
            });
        } else {
            // Return default settings
            res.status(200).json({
                darkMode: false,
                highContrast: false,
                fontSize: 14
            });
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

module.exports = {
    saveSettings,
    fetchSettings
}; 