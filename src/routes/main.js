// Import express.
const express = require("express");

// Create a router to separate routes into different files.
const router = express.Router()

// "Hey app (nickname for express), keep listening to the port, when someone knocks on it,"
// "that is, makes a GET request ending with '/', you will send the response and render the EJS."
router.get("/", function(req, res) {
    return res.render("homepage.ejs")
});

// Export router.
module.exports = router;
