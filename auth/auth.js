// Import bcrypt and userModel

const bcrypt = require('bcrypt');

const userModel = require('../models/userModel');

const jwt = require('jsonwebtoken');

// Exporting a function called 'login', which handles the login request
exports.login = (req, res, next) => {
    // Extracting email and password from the request body
    let email = req.body.email;
    let password = req.body.password;

    console.log('Looking up user with email:', email); // Log the email


    // Using the 'lookup' method of 'userModel' to find the user in the database
    userModel.lookupEmail(email, (err, user) => {
        // Handling errors from the database lookup
        if (err) {
            console.log("Error looking up user:", err);
            return res.render('users/login', { errorMessage: "Error: User does not exist." });
        }

        console.log('Lookup result:', user); // Log the lookup result
        // If no user is found in the database
        if (!user) {
            console.log("User with email", email, "not found.");
            // Redirecting to the registration page with a message
            return res.redirect('/registration?message=' + encodeURIComponent("Error: User not found with that email. Please register."));
        }

        // Comparing the password provided by the user with the hashed password stored in the database
        bcrypt.compare(password, user.password, (err, result) => {
            // Handling errors from bcrypt
            if (err) {
                console.error("Error comparing passwords:", err);
                // Sending a 403 Forbidden status code if there's an error
                return res.render('users/login', { errorMessage: "Error comparing passwords." })
            }

            // If the password matches
            if (result) {
                // Log the successful login
                console.log("User", email, "logged in successfully.");
                
                // Creating a JWT token with the user's email as payload
                let payload = { email: user.email , role: user.role, name: user.firstName + " " + user.secondName, id: user._id};
                let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
                // Setting the JWT token as a cookie
                res.cookie("jwt", accessToken);
                req.payload = payload;

                if(user.role === 'admin'){
                    return res.redirect('/admin');
                }
                else if(user.role === 'donator'){
                    next();
                }
                // Proceeding to the next middleware function
                
            }
            else {
                //if the password doesn't match
                return res.render('users/login', { errorMessage: "Error: Incorrect password." });
            }
        });
    });
}


// Normal verification function for donators
exports.verify = (req, res, next) => {
    let accessToken = req.cookies.jwt;

    if (!accessToken) {
        req.isLoggedIn = false;
        next();
    } 
    else {
        let payload;
        try {
            payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            req.payload = payload;
            req.isLoggedIn = true;
            req.name = payload.name;
            req.role = payload.role;
            next();
        } catch (e) {
            req.isLoggedIn = false;
            next();
        }
    }
};

exports.verifyDonator = (req,res,next)=> {
    let accessToken = req.cookies.jwt;

    let payload;
    
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // If the user is a donator, proceed
        if(payload.role === 'donator'){
            req.isLoggedIn = true;
            req.name = payload.name;
            req.payload = payload;
            req.userId = payload.id;
            next();
        }
        // Logged in just not a donator
        else{

            req.isLoggedIn = true;
            next();
        }
 
    }
    // If any errors, send an unauthorised message
    catch(e){
        req.session.errorMessage = 'Error: Unauthorized. Please login.';
        next();
    }

}

// Verifies if the user is an admin
exports.verifyAdmin = (req, res, next) => {
    let accessToken = req.cookies.jwt;

    let payload;
    
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // If the user is an admin, proceed
        if(payload.role === 'admin'){
            req.isLoggedIn = true;
            req.name = payload.name;
            req.payload = payload;
            next();
        }
        else{
            next();
        }
    }
    // If any errors, send an unauthorised message
    catch(e){
        req.session.errorMessage = 'Error: Unauthorized. Please login.';
        next();
    }
};