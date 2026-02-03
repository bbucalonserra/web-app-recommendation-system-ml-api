// Import express.
const express = require("express");

// Create a router to separate routes into different files.
const router = express.Router()

// Importing from database.js
const db = require("../config/database.js");

// Importing file with products.
// Two dots means one directory up.
const productsTemplate = require('../data/products.json');

// EJS.
// Reminder: here it will always be what is defined in app + this. Example: if in app it is "/",
// it will be / + forms; if it is + /teste, it will be /teste + /forms = /teste/forms.
// We pass the JSON as the second argument.
router.get("/recommendations", function(req, res) {
    /*
    SUMMARY OF THE GET METHOD FOR RENDERING WITH ML SERVER:

    --------------------------------------------------
    First, I select the user's form data.
    Next, I create an object called userData with all the outputs stored in the database.

    With the information stored in userData... then I make an HTTP POST request using
    await fetch (await because I need to wait for the user to reach this step).

    I define the method, the headers (based on the FastAPI /docs), and the body will always,
    in my case, be a JSON, so I use JSON.stringify(userData) to transform the object into JSON.

    I create a variable called dictProbas that will receive the response JSON, that is response.json().

    Finally, I create an empty object called finalRecommendations for each product ID in my dictProbas...
    then, as soon as it finds an ID in my dictionary that is the output of the ML server, I will add (push)
    into the finalRecommendations object the name, category, description, and probability,
    where the first three come from the details JSON from productsTemplate and the probability from dictProbas.
   --------------------------------------------------
    */


    // Retrieve the user from the session.
    const loggedUser = req.session.username;

    // If there is no logged-in user, redirect to login.
    if (!loggedUser) {
        return res.redirect("/login");
    }

    // FETCH DATA FROM THE DATABASE (Instead of JSON)
    // We select the data that the user filled in the form.
    const query = "SELECT * FROM forms WHERE username = ?";

    db.get(query, [loggedUser], async (err, row) => {
        // If there is an error or the filled form is not found.
        if (err || !row) {
            return res.send("Please, fill the forms before");
        }

        try {
            // PREPARE DATA FOR PYTHON
            // The model expects a JSON with integers.
            // Since we changed the database to INTEGER, 'row' will already come correctly.
            const userData = {
                age: row.age,
                sex: row.sex,
                education: row.education,
                has_children: row.has_children,
                has_property: row.has_property,
                has_car: row.has_car,
                ever_loan: row.ever_loan,
                loan_paid: row.loan_paid,
                annual_salary: row.annual_salary,
                invested_amount: row.invested_amount
            };

            /*
            Calling the Python API.
            We will use await, because we will need an async function waiting for the ML server output.
            In addition, we will use fetch with the server address.
            As the second argument of fetch, we pass an object with the protocol "rules".
            We will use: method (POST), headers (metadata, format, etc.), and body (content).
            In headers, we always set the Content-Type that we will send.
            In this case, we use application because it is JSON, which is structured data, but it could be:
                - text/ (human-readable data, such as html or css)
                - image/ (pixel data)
                - video/ (media files)
                - audio/ (media files)
                - application/ (json etc.)
            */

            // This is exactly where JavaScript makes the request to our ML server.
            // Here, the request data is stored, where the body contains the probabilities.
            const response = await fetch("http://127.0.0.1:8000/predict", {
                // Request method.
                method: "POST",

                /*
                What we are requesting.
                WE CAN VERIFY this in the ML server /docs,
                Right below "Responses", we have "Media type" for the codes.
                200 and 422, where:
                    - 200 success (request received, understood, and processed), node sent data,
                    python calculated using logistic regression and returned the probabilities.
                    - 422 content error (request received, but the data inside it is wrong),
                 that is, node sent the JSON package, but the content does not match what Python expects.
                */
                headers: { "Content-Type": "application/json" },

                // The userData object exists in RAM as an object "{age: 29, ...}", an object exclusive to
                // JavaScript, therefore, we need to transform it into JSON using JSON.stringify.
                body: JSON.stringify(userData)
            });

            // If Python returns an error (e.g., 422 or 500), we handle it here.
            if (!response.ok) {
                throw new Error("Error in loading recommendations.");
            }

            // Python returns: { "personal_loan": 0.85, "mortgage": 0.20 ... }
            // Can be verified at http://127.0.0.1:8000/docs
            // When calling response.json(), we are unpacking the body and transforming it into JSON.
            const dictProbas = await response.json();

            // Creating a copy of the JSON with information.
            const finalRecommendations = [];

            // 
            for(let productID in dictProbas) {
                // We search in our "Dictionary" (JSON) for the static data of this product.
                // The find method will search in productsTemplate when productID matches the id,
                // FOR EACH productID in dictProbas.
                const details = productsTemplate.find(function(p) {
                        return p.id === productID;
                    });

                if (details) {
                    finalRecommendations.push({
                        name: details.name,
                        category: details.category,
                        description: details.description,
                        probability: dictProbas[productID] // Dynamic data coming from ML
                    });
                }
            }

        // Sorting.
        finalRecommendations.sort(function(a, b) {
            return b.probability - a.probability;
        });

        // Return response rendering the page.
        return res.render("user-homepage.ejs", { products: finalRecommendations });
        } catch (error) {
            console.log(error);
            return res.status(500).send("AI Server is offline.");
        }
    });
});

// Export router.
module.exports = router;
