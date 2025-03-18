const express = require("express");
const router = express.Router();
const path = require("path");

// Serve the toolbox.js file
router.get("/Scripts/toolbox.js", (req, res) => {
  res.sendFile(path.join(__dirname, "../Public/Scripts/toolbox.js"));
});

// ...existing routes...

module.exports = router;
