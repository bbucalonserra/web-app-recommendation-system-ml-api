// Import express.
const express = require("express");

// Create a router to separate routes into different files.
const router = express.Router()

// Importing from database.js
const db = require("../config/database.js");

// Login route.
router.get("/login", function(req, res) {
    // IF ERROR:
    // We get the message that was saved in the POST (if it exists)
    const erroMsg = req.session.errorMessage;

    // Delete it from the session right after reading.
    // This way, if the user presses F5, the message disappears from the screen.
    delete req.session.errorMessage;

    // We pass the message to the EJS (if it is empty, it will pass undefined)
    return res.render("login.ejs", { erro: erroMsg });
});

// Method to check if the user exists; if yes, logs in, if not, does not log in.
// We use POST because it goes in the request body.
// POST sends data to be processed, that is why we use it.
// POST has no character limit.
router.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const checkUserQuery = "SELECT * FROM users WHERE username = ? AND password = ?"

    // db.run has three parameters: the SQL query, the parameters (inside []) that will replace the "?"
    // WE USE DB.GET BECAUSE WE WANT THE DATABASE TO RETURN INFORMATION.
    // The first parameter of the callback function is always an error (err).
    // The second is the result (output) of the callback.
    db.get(checkUserQuery, params = [username, password], function(err, user) {
        
        // If there is any error, show the error.
        if (err) {
            return res.send(err.message);
        }

        // If there is a user, log in correctly. Otherwise, send invalid user or password.
        if (user) {
            // Save the username in the session. Only save if the login is executed!
            req.session.username = req.body.username;

            // User is a JavaScript object with the query output!
            // Therefore, when we do user.is_forms_completed, we are accessing the column.
            // If the forms are completed.
            if (user.is_forms_completed === 1) {
                return res.redirect("/recommendations"); 
            } else {

                // If the forms are not completed, go to the forms page.
                return res.redirect("/forms");  
            }

        } else {
            // Invalid password or user.
            req.session.errorMessage = "Invalid user or password.";

            return res.redirect("/login");
        }
    })
})

// Create user route.
router.get("/create-user", function(req, res) {

    // We set a null error message.
    return res.render("create-user", { errorMessage: null });
});

// We will collect what was captured by the user input via HTML and store it (POST) in variables.
// Then, post them to the database.
router.post("/create-user", function(req, res) {

    // Here, it will store what was received in the server RAM memory.
    // In the query, the "?" represent placeholders, since the direct values are not placed in the query to keep it dynamic.
    const username = req.body.username;
    const password = req.body.password; 
    const name = req.body.name;
    const lastName = req.body.last_name;
    const createUserQuery = "INSERT INTO users (username, password, name, last_name, is_forms_completed) VALUES (?, ?, ?, ?, 0)";
    const createUsernameQuery = "INSERT INTO forms (username) VALUES (?)";

    // Save the username in the session!
    req.session.username = req.body.username;


    // WE USE RUN BECAUSE IT IS ONLY TO EXECUTE AN ACTION.
    // Database (insert into).
    // run will execute the query. Parameters: query, array (list) with the consts that will be inserted,
    db.run(createUserQuery, params = [username, password, name, lastName], function(err){

        // If there is any error. Otherwise, create.
        if (err) {
            //
            if(err.message.includes("UNIQUE constraint failed") || err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).render("create-user", {errorMessage: "This user alerady exist."});
            }
        }

        db.run(createUsernameQuery, params = [username], function(err){
            // Form error. Redirect to create-user.
        if (err) {
            //
            if(err.message.includes("UNIQUE constraint failed") || err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).render("create-user", {errorMessage: "This user alerady exist."});
            }
        }

            // Redirect to login page.
            return res.redirect("/login");
        });
    });
});

// Export router.
module.exports = router;
