// src/Routes/authRoutes.js

const express = require('express');
const router = express.Router();
const logoutController = require('../Controllers/logoutController');

// Define the logout route
router.get('/logout', logoutController.logout);

module.exports = router;
