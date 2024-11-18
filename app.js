/*
The code sets up a simple Express server that uses EJS for rendering views and connects to a database.
It defines routes for serving a registration page and handling user registration.
The application is structured to serve static files, parse request bodies, handle 
sessions, and manage certain errors.
*/


// Load environment variables from .env file
require('dotenv').config();

// importing required Modules
const express = require('express'); // framework to build web applications
const app = express(); 
const bodyParser = require('body-parser'); // Import body-parser
const path = require('path'); // to work with file and directory paths
const sessionConfig = require('./src/Config/config_session'); // imported from config_session file
const { connectToDatabase } = require('./src/Config/dbh'); // imported from dbh file
const registerRoutes = require('./src/Routes/registerRoutes'); // routes for user registration functionality
const loginRoutes = require('./src/Routes/loginRoutes'); // routes for user login functionality
const PORT = process.env.PORT || 4000; 
const ejs = require('ejs'); // ejs is a templating engine for rendering HTML

// setting up views and template engine
app.set('views', path.join(__dirname, 'src', 'Views')); 
// console.log('Views directory set to:', path.join(__dirname, 'src', 'Views', 'RegisterPage.ejs')); // DEBUGGING
app.set('view engine', 'ejs'); 

// Serve static files
app.use(express.static(path.join(__dirname, 'src', 'Public')));
app.use(express.static(path.join(__dirname, 'src', 'Views')));
app.use('/node_modules', express.static('node_modules'));
app.use(express.static(path.join(__dirname, 'src', 'blocks')));
app.use(express.static(path.join(__dirname, 'src', 'generators')));
app.use(express.static(path.join(__dirname, 'src')));


// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session configuration
sessionConfig(app);

// Connect to the database
connectToDatabase();

// Define the home route
app.get('/api/home', (req, res) => {
    res.render('index.ejs'); // Renders HomePage
});

// Define the login route
app.get('/api/login', (req, res) => {
    res.render('LoginPage'); // Renders LoginPage
});

// Define the play route
app.get('/api/play', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'Views', 'PlayPage.html')); // Renders index.html
});

// Define the settings route
app.get('/api/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'Views', 'SettingsPage.html')); // Renders SettingsPage.html
});

// Define the dashboard route
app.get('/api/dashboard', (req, res) => {
    if (!req.session.id) {
        return res.redirect('/api/login'); // Renders DashboardPage.html // Redirect to login if not authenticated
    }
    res.sendFile(path.join(__dirname, 'src', 'Views', 'DashboardPage.html'));
});

app.get('/api/register', async (req, res) => {
    try {
        const errors = req.session.errors || []; 
        req.session.errors = []; // Clear errors after rendering
        
        res.render('RegisterPage', { errors: [] }); // Pass errors to the view
    } catch (err) {
        console.error("Error rendering RegisterPage:", err);
        return res.status(500).json({ error: 'Error rendering view' });
    }
});

// API routes
app.use('/api', registerRoutes);
app.use('/api', loginRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error occurred:", err);
    res.status(err.status || 500).json({ error: err.message || 'Something broke!' });
});

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}/api/home`); 
    });
};

startServer();