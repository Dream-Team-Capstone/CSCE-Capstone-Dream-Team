module.exports.logout = (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Failed to log out");
      }
      // Redirect to dashboard
      res.redirect('/api/dashboard');
    });
};