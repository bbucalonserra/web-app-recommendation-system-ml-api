// Import express.
const express = require("express");

// Create a router to separate routes into different files.
const router = express.Router()

// Importing from database.js
const db = require("../config/database.js");


// EJS.
// Reminder: here it will always be what is defined in app + this. Example: if in app it is "/", it will
// be / + forms; if it is + /teste, it will be /teste + /forms = /teste/forms.
router.get("/forms", function(req, res) {

    // Retrieving username saved during login or creation.
    const loggedUser = req.session.username;

    // If user hasn't logged in.
    if (!loggedUser) {
            return res.redirect("/login");
        }

    return res.render("forms.ejs");
});

// Update forms.
router.post("/forms", function (req, res) {

    // Retrieving username saved during login or creation.
    const loggedUser = req.session.username;

    // Redirect to login.
    if (!loggedUser) {
        return res.redirect("/login");
    }

    // Varaibles from forms.
    const age = req.body.age;
    const sex = req.body.sex;
    const education = req.body.education;
    const has_children = req.body.has_children;
    const has_property = req.body.has_property;
    const has_car = req.body.has_car;
    const ever_loan = req.body.ever_loan;
    const loan_paid = req.body.loan_paid;
    const annual_salary = req.body.annual_salary;
    const invested_amount = req.body.invested_amount;


    // Variables.
    const createFormsQuery = `
        UPDATE forms
        SET
            age = ?,
            sex = ?,
            education = ?,
            has_children = ?,
            has_property = ?,
            has_car = ?,
            ever_loan = ?,
            loan_paid = ?,
            annual_salary = ?,
            invested_amount = ?
        WHERE username = ?
    `;

    const params_forms = [
        age,
        sex,
        education,
        has_children,
        has_property,
        has_car,
        ever_loan,
        loan_paid,
        annual_salary,
        invested_amount,
        loggedUser
    ];

    // Running db.
    db.run(createFormsQuery, params_forms, function(err){
        if (err) {

            // Return if error.
            return res.send("Error while submiting forms: " + err.message);
        } 

        // Update the forms completed flag to 1.
        db.run("UPDATE users SET is_forms_completed = 1 WHERE username = ?", loggedUser, function(err){
          if(err) {
            return res.send("Error updating the is_forms_completed column");
          }  
        })

        // Redirect to recommendations.
        res.redirect("/recommendations");
    })
})

//
module.exports = router;
