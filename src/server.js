require('dotenv').config();

const express = require("express");
const ejs = require('ejs');
const port = process.env.PORT || 3000;

// "Hey express, I will call you app."
const app = express();

// Importing session to store the user's name.
const session = require('express-session');

// Importing the path module.
const path = require('path');

// Sanitizer.
const sanitizer = require('express-sanitizer');

// Call everything that is in the routes.
// The REQUIRE
const main = require("./routes/main");
const users = require("./routes/users");
const forms = require("./routes/forms");
const recommendations = require("./routes/recommendations");

// Configuration for EJS.
// __dirname is the 'src' folder. path.join ensures it finds 'src/views'
// Express, take that screen location setting of yours (the 1st views) and define that
// its address is: my current location (__dirname) combined with my folder
// called views (the 2nd views).
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Basically, telling express to learn how to read forms.
app.use(express.urlencoded({ extended: true }));

// Tell that public is static.
app.use(express.static(path.join(__dirname, 'public')));

// Use sanitize.
app.use(sanitizer());

// Keeps it in memory. Creates a cookie in the browser that stores an
// encrypted identification code (connect.sid). On the server, in RAM memory,
// it reserves space to store information that survives while the user
// jumps from page to page, that is, everything that starts with req.session.
app.use(session({
    secret: 'any-special-secret-text', // It can be any phrase
    resave: false, // Does not save the session if there are no changes
    saveUninitialized: false, // Creates a session even if nothing has been stored
    cookie: { 
        secure: false, // 'false' (without HTTPS)
        maxAge: 600000 // Session lifetime: 1 hour
    }
}));

// Calling the main routes. This is what goes in the URL.
app.use('/', main);
app.use('/', users);
app.use('/', forms);
app.use('/', recommendations);

// Listening to the port. It does not load previously stored files, it only stores in memory.
app.listen(port, function() {
    console.log(`Listening to the port ${port}...`)
})
