// Import express.
const express = require("express");

// Create a router to separate routes into different files.
const router = express.Router()

// Import bcrypt for hashing.
const bcrypt = require('bcrypt')

// Import validation.
const { check, validationResult } = require('express-validator'); 

// Import sanitizer.
const sanitizer = require('express-sanitizer');

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
// NOTE: we could use allways router.post("URL", middleware1, middleware2, middleware3, ..., funçãoFinal).
router.post("/login", 
            check('username').notEmpty().withMessage("Please, fill with your username."),
            check('password').isLength({min : 6}).withMessage("Password must have at least 6 characters."),
            function(req, res) {

                /*express-validator logic.
                Check length of password.

                check is from express-validator, where it should go for req.body.
                */

                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    const errorMessage = errors.array()[0].msg;
                    return res.render("login.ejs", { erro: errorMessage });
                };

                const username = req.body.username;
                const checkUserQuery = "SELECT * FROM users WHERE username = ?"

                // db.run has three parameters: the SQL query, the parameters (inside []) that 
                // will replace the "?"
                // WE USE DB.GET BECAUSE WE WANT THE DATABASE TO RETURN INFORMATION.
                // The first parameter of the callback function is always an error (err).
                // The second is the result (output) of the callback.
                /*
                Inside row, there are:
                    {
                        row1: "x",
                        row2: "y",
                        row3: "z"
                    }

                NOTE: THE SQLITE RETURNS WITH {}, THE MYSQL RETURN WITH '[]'.
                */

                db.get(checkUserQuery, params = [username], function(err, row) {

                    // If there is any error, show the error.
                    if (err) {
                        return res.send(err.message);
                    }

                    if (!row) {
                        return res.render("login.ejs", { erro: "User not found." });
                    }

                    else {
                        // Variables to store hashed password and userId.
                        const hashedPassword = row.password;
                        const userId = row.username;

                        // Compare password from form with password retrieved from the database.
                        // NOTE: The bcrypt compare does not store the real password,
                        // it just compare the input password hashed with the hashed password that is
                        // stored in the database.
                        // ROW2 returns true or false! If is a match or not.
                        
                        bcrypt.compare(req.body.password, hashedPassword, function(err, isMatch) {
                            if (err) {
                                return res.send(err.message);
                            }

                            // If there's no error and the result of the row is not none / empety.
                            else if (isMatch == true) {

                                // Save the username in the session. Only save if the login is executed!
                                req.session.username = userId;

                                // User is a JavaScript object with the query output!
                                // Therefore, when we do user.is_forms_completed, we are accessing the column.
                                // If the forms are completed.

                                if (row.is_forms_completed === 1) {
                                    return res.redirect("/recommendations"); 
                                } else {
                                    // If the forms are not completed, go to the forms page.
                                    return res.redirect("/forms");  
                                }
                            }

                            // If password does not match.
                            else {
                                res.send("Login failed: passwords don't match")
                            }
                        })
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
router.post("/create-user", 

            /*
            Application of VALIDATION.
            The input comes from the front end, therefore in the POST method it's
            already available the username and password.
            */
            check('username').notEmpty().withMessage("Please, fill with your username."),
            check('password').isLength({min : 6}).withMessage("Password must have at least 6 characters."),
            function(req, res) {

                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    const errorMessage = errors.array()[0].msg;
                    return res.render("create-user", { errorMessage: errorMessage });
                };


                /*
                Salt is a random string that is added to the hash in case of different users uses the same password.
                If saltRounds = 10, the algorithm runs 2^10 = 1024 times, so:
                1 unit of salt round double the time the server takes to generate or verify the password.
                Therefore, the Salt algorithm creates a random string,
                then, concatenate with the real password, run the function of the algorithm 2^10 times (1024.)
                So, the first result goes to the second function, then second to the thirds, etc. Until 1024.

                The salt uses the algorithm Blowfish.
                E.g. a hashed password: $2b$10$YmQMbhYuSUqcLEOEj8he0u9gK3TzSz4m/cduvNJCzVP/P9zi65Dg2
                "$10$" run the loop 1024 times. If changed to 12, it will show $12$.
                HENCE, THE SAME STRING WILL HAVE A COMPLETE DIFFERENT VALUE SINCE THE SALT IS RANDOM AND ITS CHANGED.
                $2b$ = version of bcrypt used.
                "$10$" number of saltrounds.
                The first 22 characters are generated after the cost of the salt.

                NOTE: when comparing, bcrypt reads the rules of the comparison (in the database), then uses the
                same rules and apply them into the inputed password. That's how the comparison is properly made.
                */

                // Application of SANITIZATION (however not for passwords!).
                // Example: Bruno<script>alert('Hacked')</script> BECOMES Bruno.
                const saltRounds = 10;
                const password = req.body.password; 
                const name = req.sanitize(req.body.name);
                const lastName = req.sanitize(req.body.last_name);
                const username = req.sanitize(req.body.username);
                
                // Bcrypts function.
                bcrypt.hash(password, saltRounds, function(err, hashedPassword) {

                    //  Insert query.
                    const createUserQuery = "INSERT INTO users (username, password, name, last_name, is_forms_completed) VALUES (?, ?, ?, ?, 0)";

                    // Parameters.
                    // NOTE: APPLY WITH SANITIZER.
                    let insertUsersParams = [username, hashedPassword, name, lastName]
                    
                    // WE USE RUN BECAUSE IT IS ONLY TO EXECUTE AN ACTION.
                    // Database (insert into).
                    // run will execute the query. Parameters: query, array (list) with the consts that will be inserted,
                    db.run(createUserQuery, insertUsersParams, function(err){

                        // Save the username in the session!
                        req.session.username = username;

                        // INsert query
                        const createUsernameQuery = "INSERT INTO forms (username) VALUES (?)";


                        // Insert params.
                        let insertFormsParams = [username]


                        // If there is any error. Otherwise, create.
                        if (err) {
                            //
                            if(err.message.includes("UNIQUE constraint failed") || err.code === 'SQLITE_CONSTRAINT') {
                                return res.status(400).render("create-user", {errorMessage: "This user alerady exist."});
                            }
                        }

                        db.run(createUsernameQuery, insertFormsParams, function(err){
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
                })
            }
);

// Export router.
module.exports = router;
