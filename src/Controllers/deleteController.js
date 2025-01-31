const { deleteUser } = require('../../src/Models/deleteModel');
const bcrypt = require('bcryptjs'); // Use bcryptjs since you're using bcryptjs in the login route
const { pool } = require('../Config/dbh');

exports.deleteAccount = async (req, res) => {
    try {
        // console.log('Received request to delete account.'); // DEBUG
        const { email, password } = req.body;
        // console.log('Email provided:', email); // DEBUG
        // console.log('Session details:', req.session); // DEBUG

        if (!email || !password) {
            return res.status(400).render('DeleteAccountPage', {
                errors: [{ msg: 'Email and password are required.' }]
            });
        }

        if (!req.session.userId || !req.session.email) {
            return res.status(400).render('DeleteAccountPage', {
                errors: [{ msg: 'You must be logged in to delete your account.' }]
            });
        }

        if (req.session.email !== email) {
            return res.status(400).render('DeleteAccountPage', {
                errors: [{ msg: 'Email does not match the logged-in user.' }]
            });
        }

        // Correct query syntax for PostgreSQL
        const { rows } = await pool.query('SELECT password FROM user_info WHERE email = $1', [email]);

        if (rows.length === 0) {
            return res.status(400).render('DeleteAccountPage', {
                errors: [{ msg: 'User not found.' }]
            });
        }

        const storedPassword = rows[0].password;
        const isPasswordValid = await bcrypt.compare(password, storedPassword);

        if (!isPasswordValid) {
            return res.status(400).render('DeleteAccountPage', {
                errors: [{ msg: 'Password is incorrect.' }]
            });
        }

        // console.log('Deleting user from database...'); // DEBUG
        await deleteUser(req.session.userId);

        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).render('DeleteAccountPage', {
                    errors: [{ msg: 'An error occurred during account deletion.' }]
                });
            }
            // console.log('User account deleted successfully.'); // DEBUG
            res.render('DeletingAccountPage');
        });
    } catch (error) {
        console.error('Unexpected error in deleteAccount:', error);
        res.status(500).render('DeleteAccountPage', {
            errors: [{ msg: 'An unexpected error occurred.' }]
        });
    }
};
