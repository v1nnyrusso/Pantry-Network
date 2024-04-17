
// Import the user model
const userDAO = require('../models/userModel.js');


// Create a callback function for handling response to /about
exports.about_res = (req, res) => {
    res.send('<h1> Wellcome to the about page. This is not yet implemented</h1>')

}

// Landing page function
exports.landing_page = (req, res) => {

    // If user is logged in and has a payload, render index with user object and logged in status variable
    if (req.payload && req.isLoggedIn) {
       return res.render('index', {
            title: "Scottish Pantry Network",
            isLoggedIn: req.isLoggedIn,
            user: req.name,
            isHomePage: true,
            role: req.role
            
        })
    }
    // Else, render index without user object and logged in status variable, as they arent logged in
    else{
        return res.render('index', {
            title: "Scottish Pantry Network",
            isHomePage: true
        })
    }
    

}

// Action method for registration page
exports.registration_get = (req, res) => {

    // If user is logged in, redirect to index
    // use return statement to immediately exit function if user is logged in
    if (req.isLoggedIn) {
        return res.redirect('/');
    }

    // Gets string param in route, put it in a local variable
    let errorMessage = req.query.message;
    return res.render("users/registration", {
        message: errorMessage,
        title: "Register"
    })
}

// Action to handle registration of a new user
exports.post_new_user = (req, res) => {

    // Get the data from the request body
    const { firstName, secondName, organisation, number, email, password } = req.body;

    // Get the confirm password from the request body
    let confirmPassword = req.body.password2;


    // Set the source of the user to be from registration to decipher role in create method
    source = 'registration';

    // If email or password is somehow missing, send a 401 status code
    if (!email || !password) {
        
        res.status(401).send('No username or password.');
        return;
    }


    // If the passwords dont match, rerender and send error message
    if (password != confirmPassword) {
        return res.render("users/registration", {
            message: "Error: Passwords must match."
        })
    }

    // Lookup user by email tom make sure they dont exist
    userDAO.lookupEmail(email, (err, u) => {
        if (u) {

            // Set error message in session
            req.session.errorMessage = "Error: User " + email + " exists. Please login.";
            
            // Return to login as they exist
            return res.redirect('/login');
        }

        // Use userDAO create method to create a new
        userDAO.create(firstName, secondName, organisation, number, email, password, source);

        // This will only be reached if the user does not exist, so no headers have been sent yet
        res.redirect('/login');
    })
}

// Action method for requesting login page
exports.login_get = (req, res) => {

    // If theyre logged in, redirect to root
    if (req.isLoggedIn) {
        return res.redirect('/');
    }

    // Error message handling
    let message = req.session.errorMessage;
        
    req.session.errorMessage = null;

    // Correct the syntax error here
    res.render('users/login', {
        errorMessage: message,
        title: 'Login'

    });

}


// Handle login post request
exports.login_post = (req, res) => {

    res.redirect('/');

}

// Clear jwt and logout, redirect to index
exports.logout = (req, res) => {
    res.clearCookie("jwt").status(200).redirect("/");
}
