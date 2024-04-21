// Import the user model
const userDAO = require('../models/userModel.js');
const contactDAO = require('../models/contactModel.js');
const pantryDAO = require('../models/pantryModel.js');

// Create a callback function for handling response to /about
exports.about_res = async (req, res) => {
    try {

        // Get list of pantries
        const pantriesList = await pantryDAO.getPantries();
 
        console.log(req.isLoggedIn, req.session.user, req.role)
        // If the user is logged in, render the about page with the user object and logged in status variable
        if (req.session.user) {
            return res.render('users/about', {
                title: "About Us",
                // If the user is logged in, set isLoggedIn to true
                isLoggedIn: true,
                user: req.session.user,
                isHomePage: true,
                role: req.session.user.role,
                pantries: pantriesList
            })
        } else {
            return res.render('users/about', {
                title: "About Us",
                isHomePage: true,
                pantries: pantriesList
            })
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Error fetching pantries");
    }
}

// Landing page function
exports.landing_page = (req, res) => {
    // If user is logged in and has a payload, render index with user object and logged in status variable
    if (req.payload && req.isLoggedIn) {
        console.log(req.userId);
        return res.render('index', {
            title: "Scottish Pantry Network",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isHomePage: true,
            role: req.session.user.role
        })
    }
    // Else, render index without user object and logged in status variable, as they arent logged in
    else {
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
    let { firstName, secondName, organisation, number, password, email } = req.body;

    // Capitalize the first letter of the first and last name
    firstName = capitalizeFirstLetter(firstName);
    secondName = capitalizeFirstLetter(secondName);
    organisation = capitalizeFirstLetter(organisation);
    email = email.toLowerCase();

    // Get the confirm password from the request body
    let confirmPassword = req.body.password2;

    // Set the source of the user to be from registration to decipher role in create method
    let source = 'registration';

    // If email or password is somehow missing, send a 401 status code
    if (!email || !password) {
        res.status(401).send('No username or password.');
        return;
    }

    // Check if the phone number is 11 digits
    if (number.length > 11 || number.length < 11 || isNaN(number)) {
        console.log("Error: Phone number must be 11 digits.")
        message = "Error: Phone number must be 11 digits."
        return res.render("users/registration", {
            message: message
        });
    }

    // If the passwords don't match, rerender and send an error message
    if (password != confirmPassword) {
        return res.render("users/registration", {
            message: "Error: Passwords must match."
        })
    }

    // Lookup user by email to make sure they don't exist
    userDAO.lookupEmail(email, (err, u) => {
        if (u) {

            // Set error message in session
            req.session.errorMessage = "Error: User " + email + " exists. Please login.";

            // Return to login as they exist
            return res.redirect('/login');
        }

        // Use userDAO create method to create a new
        userDAO.create(firstName, secondName, organisation, number, email, password, req.body.pantryId, source);

        // Redirect to login page
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

    // Clear session and cookie
    req.session.destroy();
    res.clearCookie("jwt").status(200).redirect("/");
}

exports.getContactPage = (req, res) => {


    if (req.isLoggedIn) {
        return res.render('contact/contact', {
            title: "Contact Us",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isHomePage: true,
            role: req.session.user.role
        })
    }
    else {
        return res.render('contact/contact', {
            title: "Contact Us",
            isHomePage: true
        })
    }

}

exports.postContactForm = (req, res) => {
    let { subject, email, message } = req.body;

    // Capitalize the first letter of the first and last name
    email = email.toLowerCase();

    // If email or password is somehow missing, send a 401 status code
    if (!email || !subject || !message) {
        res.render("contact/contact", {
            title: "Contact Us",
            errorMessage: "Error: Please fill in all fields.",
            isHomePage: true
        });
        return;
    }

    req.session.successMessage = "Message sent successfully.";
    successMessage = req.session.successMessage;
    req.session.successMessage = null;

    // Create a new contact message
    contactDAO.createContact(subject, email, message);

    if (req.isLoggedIn) {
        return res.render('contact/contact', {
            title: "Contact Us",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isHomePage: true,
            role: req.session.user.role,
            successMessage: successMessage,
        })
    }
    else {

        // Redirect to login page
        res.render("contact/contact", {
            title: "Contact Us",
            successMessage: successMessage,
            isHomePage: true

        });
    }

}

exports.faq_res = (req, res) => {
    if (req.isLoggedIn) {
        return res.render('users/faq', {
            title: "FAQ",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isHomePage: true,
            role: req.session.user.role
        })
    }
    else {
        return res.render('users/faq', {
            title: "FAQ",
            isHomePage: true
        })
    }
}

// Capitalize the first letter of a string passed in
function capitalizeFirstLetter(string) {
    if (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    else {
        return console.error("Error: String is null")
    }

}




