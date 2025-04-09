/*
The code sets up a simple Express server that uses EJS for rendering views and connects to a database.
It defines routes for serving a registration page and handling user registration.
The application is structured to serve static files, parse request bodies, handle 
sessions, and manage certain errors.
*/

// Load environment variables from .env file
require("dotenv").config();

// importing required Modules
const express = require("express"); // framework to build web applications
const app = express();
const bodyParser = require("body-parser"); // Import body-parser
const path = require("path"); // to work with file and directory paths
const sessionConfig = require("./src/Config/config_session"); // imported from config_session file
const { connectToDatabase, pool } = require("./src/Config/dbh"); // imported from dbh file
const registerRoutes = require("./src/Routes/registerRoutes"); // routes for user registration functionality
const loginRoutes = require("./src/Routes/loginRoutes"); // routes for user login functionality
const deleteRoutes = require("./src/Routes/deleteRoutes");
const projectTutorialRoutes = require("./src/Routes/ProjectTutorialsRoutes");
const deleteController = require("./src/Controllers/deleteController");
const PORT = process.env.PORT || 4000;
const ejs = require("ejs"); // ejs is a templating engine for rendering HTML
const cookieParser = require("cookie-parser");
const {
  clearUserProgress,
} = require("./src/Controllers/clearProgressController");
const settingsController = require("./src/Controllers/settingsController");
const { exec } = require("child_process");
const fs = require("fs");

// setting up views and template engine
app.set("views", path.join(__dirname, "src", "Views"));
// console.log('Views directory set to:', path.join(__dirname, 'src', 'Views', 'RegisterPage.ejs')); // DEBUGGING
app.set("view engine", "ejs");

// Serve static files
app.use(
  express.static(path.join(__dirname, "src", "Public"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Serve Blockly files from node_modules
app.use(
  "/blockly",
  express.static(path.join(__dirname, "node_modules/blockly"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Your other static middleware
app.use("/node_modules", express.static("node_modules"));
app.use(express.static(path.join(__dirname, "src", "blocks")));
app.use(express.static(path.join(__dirname, "src", "generators")));
app.use(express.static(path.join(__dirname, "src", "serialization")));
app.use(express.static(path.join(__dirname, "src", "toolbox")));
app.use(express.static(path.join(__dirname, "src")));

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Set up session configuration
sessionConfig(app);

// Middleware to load user settings if available
app.use(async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const result = await pool.query(
        "SELECT dark_mode, high_contrast, font_size FROM user_settings WHERE user_id = $1",
        [req.session.userId]
      );

      if (result.rows.length > 0) {
        res.locals.userSettings = {
          darkMode: result.rows[0].dark_mode,
          highContrast: result.rows[0].high_contrast,
          fontSize: result.rows[0].font_size,
        };
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  }

  // Make user data available to all views
  res.locals.user = req.session.userId ? req.session.first_name : null;
  next();
});

// Move this near the top, after the middleware setup but before routes
let dbConnected = false;

const initializeServer = async () => {
  try {
    await connectToDatabase();
    dbConnected = true;
    console.log("\n🟢 Database connection successful - all features enabled");
  } catch (err) {
    console.error("\n🔴 Database connection failed:", err.message);
    console.warn(
      "⚠️  Starting server with limited functionality - database features disabled"
    );
    dbConnected = false;
  }

  // Add middleware to check database state
  app.use((req, res, next) => {
    if (!dbConnected && req.path.startsWith("/api/")) {
      const protectedRoutes = [
        "/api/register",
        "/api/login",
        "/api/dashboard",
        "/api/settings",
        "/api/project-tutorials",
      ];

      if (protectedRoutes.includes(req.path)) {
        return res.render("ErrorPage", {
          error:
            "Database services are currently unavailable. Please try again later.",
          user: null,
        });
      }
    }
    next();
  });

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server is running at: http://localhost:${PORT}/api/home`);
    if (!dbConnected) {
      console.log("⚠️  Running in limited mode - database features disabled");
    }
  });

  return server;
};

// Start the server
const startApp = async () => {
  try {
    const server = await initializeServer();
    if (!server) {
      throw new Error("Server failed to start");
    }
  } catch (err) {
    console.error("Server initialization error:", err.message);
    // Don't exit, let the app run in limited mode
  }
};

// Start the application
startApp();

// Define the home route
app.get("/api/home", (req, res) => {
  res.render("index"); // Renders HomePage
});

function redirectIfAuthenticated(req, res, next) {
  // console.log('Checking auth status:', req.session); // DEBUG
  if (req.session && req.session.userId) {
    // console.log('User is authenticated, redirecting to dashboard'); // DEBUG
    return res.redirect("/api/dashboard");
  }
  // console.log('User is not authenticated, continuing to login page'); // DEBUG
  next();
}

// Define the login route
app.get("/api/login", redirectIfAuthenticated, (req, res) => {
  // console.log('Session data:', req.session); // DEBUG
  const errors = req.session.errors || [];
  req.session.errors = []; // Clear errors after rendering
  res.render("LoginPage", {
    errors: [],
    user: req.session.userId ? req.session.first_name : null,
  });
});

// Define the play route
app.get("/api/play", (req, res) => {
  res.render("PlayPage", {
    title: "PyBlocks - Play",
    user: req.session.userId ? req.session.first_name : null,
    userSettings: res.locals.userSettings,
  });
});

// Define the settings route
app.get("/api/settings", (req, res) => {
  res.render("SettingsPage", {
    user: req.session.userId ? req.session.first_name : null,
    userSettings: res.locals.userSettings,
  });
});

// Define the dashboard route
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/api/login");
}
app.get("/api/dashboard", ensureAuthenticated, (req, res) => {
  const user = req.session.first_name;
  res.render("DashboardPage", { user });
});

app.get("/api/register", async (req, res) => {
  try {
    const errors = req.session.errors || [];
    req.session.errors = []; // Clear errors after rendering

    res.render("RegisterPage", { errors: [] }); // Pass errors to the view
  } catch (err) {
    console.error("Error rendering RegisterPage:", err);
    return res.status(500).json({ error: "Error rendering view" });
  }
});

// Define the logout route
app.post("/api/logout", (req, res) => {
  // Destroy session and log the user out
  req.session.destroy((err) => {
    if (err) {
      // console.log('Error during session destruction:', err); // DEBUG
      return res.status(500).send("Error logging out");
    } else {
      res.clearCookie("connect.sid"); // clear session cookie
      // Render the 'loggingOut.ejs' page
      res.render("LoggingOutPage");
    }
  });
});

app.get("/api/confirmDelete", (req, res) => {
  // console.log('Deleting account for user:', req.session); // DEBUG
  const errors = req.session.errors || [];
  req.session.errors = []; // Clear errors after rendering
  res.render("DeleteAccountPage", { errors });
});

// Define the delete route
app.post("/api/delete", deleteController.deleteAccount);

// Define the project tutorial route
app.get("/api/projectTutorial", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/api/login"); // Redirect if not logged in
  }

  const userId = req.session.userId;

  try {
    // Fetch progress data with default values
    const result = await pool.query(
      `SELECT COALESCE(project1_progress, 0) as project1_progress,
                    COALESCE(project2_progress, 0) as project2_progress,
                    COALESCE(project3_progress, 0) as project3_progress
             FROM user_progress 
             WHERE user_id = $1`,
      [userId]
    );

    const user_progress = result.rows[0] || {
      project1_progress: 0,
      project2_progress: 0,
      project3_progress: 0,
    };

    res.render("ProjectsPage", {
      user: req.session.first_name,
      user_progress: user_progress,
    });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).send("Server error while fetching progress");
  }
});
app.post("/api/project-tutorials/clear-progress", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await clearUserProgress(userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      details: err.message,
      code: err.code,
    });
  }
});

// Define the settings route
app.post(
  "/api/save-settings",
  ensureAuthenticated,
  settingsController.saveSettings
);

// Add route to fetch user settings
app.get(
  "/api/settings/fetch",
  ensureAuthenticated,
  settingsController.fetchSettings
);

// Define the route for Python execution
app.post("/api/run-python", (req, res) => {
  const { code } = req.body; // Get Python code from request

  // Check if the received code is empty or contains a placeholder message
  if (!code || code.trim() === "" || code.trim() === "No code generated.") {
    return res.status(400).json({ output: "No code generated." });
  }

  const tempFilePath = path.join(__dirname, "temp_script.py");
  fs.writeFileSync(tempFilePath, code); // Save the code to a file

  exec(`python "${tempFilePath}"`, (error, stdout, stderr) => {
    fs.unlinkSync(tempFilePath); // Delete the temp file after execution

    if (error) {
      return res.json({ output: stderr || "Error executing Python code." });
    }
    res.json({ output: stdout || "Python code executed successfully." });
  });
});

// Defining route for the resources page
app.get("/api/resources", (req, res) => {
  // You can pass any dynamic data to the view if necessary
  res.render("ResourcesPage", {
    user: req.session.first_name, // Send user data to the view
    userSettings: res.locals.userSettings, // Send any user settings if necessary
  });
});

app.get("/api/tutorials", (req, res) => {
  res.render("TutorialsPage");
});

// API routes
app.use("/api", registerRoutes);
app.use("/api", loginRoutes);
app.use("/api", deleteRoutes);
app.use("/api", projectTutorialRoutes);

// Add error handling for static files
app.use((err, req, res, next) => {
  if (err.code === "ENOENT") {
    res.status(404).json({ error: "File not found" });
  } else {
    next(err);
  }
});

// Error handling middleware - Keep at the end of app.js
app.use((err, req, res, next) => {
  console.error("Error occurred:", err);

  // Check if it's a database error
  if ((err.code && err.code.startsWith("23")) || err.code.startsWith("28")) {
    return res.render("ErrorPage", {
      error:
        "Database service is currently unavailable. Please try again later.",
      user: null,
    });
  }

  res.status(err.status || 500).render("ErrorPage", {
    error: err.message || "Something went wrong!",
    user: null,
  });
});
