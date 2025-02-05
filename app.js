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
const deleteRoutes = require('./src/Routes/deleteRoutes');
const projectTutorialRoutes = require('./src/Routes/ProjectTutorialsRoutes');
const deleteController = require('./src/Controllers/deleteController');
const PORT = process.env.PORT || 4000; 
const ejs = require('ejs'); // ejs is a templating engine for rendering HTML
const cookieParser = require('cookie-parser'); 


// setting up views and template engine
app.set('views', path.join(__dirname, 'src', 'Views')); 
// console.log('Views directory set to:', path.join(__dirname, 'src', 'Views', 'RegisterPage.ejs')); // DEBUGGING
app.set('view engine', 'ejs'); 

// Serve static files
app.use(express.static(path.join(__dirname, 'src', 'Public')));
app.use('/node_modules', express.static('node_modules'));
app.use(express.static(path.join(__dirname, 'src', 'blocks')));
app.use(express.static(path.join(__dirname, 'src', 'generators')));
app.use(express.static(path.join(__dirname, 'src', 'serialization')));
app.use(express.static(path.join(__dirname, 'src', 'toolbox')));
app.use(express.static(path.join(__dirname, 'src')));


// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Set up session configuration
sessionConfig(app);

// Connect to the database
connectToDatabase();

// Define the home route
app.get('/api/home', (req, res) => {
    res.render('index'); // Renders HomePage
});

function redirectIfAuthenticated(req, res, next) {
    // console.log('Checking auth status:', req.session); // DEBUG
    if (req.session && req.session.userId) {
        // console.log('User is authenticated, redirecting to dashboard'); // DEBUG
        return res.redirect('/api/dashboard');
    }
    // console.log('User is not authenticated, continuing to login page'); // DEBUG
    next();
}

// Define the login route
app.get('/api/login', redirectIfAuthenticated, (req, res) => {
    // console.log('Session data:', req.session); // DEBUG
    const errors = req.session.errors || []; 
    req.session.errors = []; // Clear errors after rendering
    res.render('LoginPage', { 
        errors: [],
        user: req.session.userId ? req.session.first_name : null
    }); 
});

// Define the play route
app.get('/api/play', (req, res) => {
    res.render('PlayPage'); // Renders index.html
});

// Define the settings route
app.get('/api/settings', (req, res) => {
    res.render('SettingsPage'); // Renders SettingsPage.ejs
});

// Define the dashboard route
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/api/login');
}
app.get('/api/dashboard', ensureAuthenticated, (req, res) => {
    const user = req.session.first_name;
    res.render('DashboardPage', { user });
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

// Define the logout route
app.post('/api/logout', (req, res) => {

    // Destroy session and log the user out
    req.session.destroy((err) => {
        if (err) {
            // console.log('Error during session destruction:', err); // DEBUG
            return res.status(500).send('Error logging out');
        }
        else{
            res.clearCookie('connect.sid'); // clear session cookie
            // Render the 'loggingOut.ejs' page
            res.render('LoggingOutPage');
        }
    });
});

app.get('/api/confirmDelete', (req, res) => {
    // console.log('Deleting account for user:', req.session); // DEBUG
    const errors = req.session.errors || [];
    req.session.errors = []; // Clear errors after rendering
    res.render('DeleteAccountPage', { errors });
});


// Define the delete route
app.post('/api/delete', deleteController.deleteAccount);

// Define the project tutorial route
app.get('/api/projectTutorial', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/api/login'); // Redirect if not logged in
    }
    
    const userId = req.session.userId;
    
    // Fetch user info and progress data
    const user_info = await user_info.findByPk(userId);
    const user_progress = await user_progress.findOne({ where: { user_id: userId } });

    res.render('ProjectsPage', {
        user_info: user_info,
        user_progress: user_progress
    });
});
    

// API routes
app.use('/api', registerRoutes);
app.use('/api', loginRoutes);
app.use('/api', deleteRoutes);
app.use('/api', projectTutorialRoutes);

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