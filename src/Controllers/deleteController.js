const bcrypt = require('bcrypt');
const { pool } = require('../Config/dbh'); // Pool of database connections

exports.deleteAccount = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get the logged-in user's session details
        const loggedInUser = req.session.user;

        // Compare session email with input email
        if (loggedInUser.email !== email) {
            return res.status(400).render('DeleteAccountPage', {
                errors: [{ msg: 'Email does not match the logged-in user.' }]
            });
        }

        // Verify the password (assuming passwords are hashed in the database)
        const [rows] = await pool.query('SELECT password FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).render('DeleteAccountPage', {
                errors: [{ msg: 'User not found.' }]
            });
        }

        const storedPassword = rows[0].password; // Get the hashed password from the database
        const isPasswordValid = await bcrypt.compare(password, storedPassword);
        if (!isPasswordValid) {
            return res.status(400).render('DeleteAccountPage', {
                errors: [{ msg: 'Password is incorrect.' }]
            });
        }

        // Perform account deletion in the database
        await pool.query('DELETE FROM users WHERE email = ?', [email]);

        // Clear the session and redirect to a confirmation page
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).render('DeleteAccountPage', {
                    errors: [{ msg: 'An error occurred while logging you out.' }]
                });
            }
            res.redirect('DeletingAccountPage'); // Redirect to a confirmation page
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).render('DeleteAccountPage', {
            errors: [{ msg: 'An error occurred while deleting your account.' }]
        });
    }
};
