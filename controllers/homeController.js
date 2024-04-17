


const userDAO = require('../models/userModel.js');


// Create a callback function for handling response to /about
exports.about_res = (req, res) => {
    res.send('<h1> Wellcome to the about page.</h1>')

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
       
        })
    }
    else
       return res.render('index', {
            title: "Scottish Pantry Network",
            isHomePage: true
        })

}

exports.registration_get = (req, res) => {

    // If user is logged in, redirect to index
    // use return statement to immediately exit function if user is logged in
    if (req.isLoggedIn) {
        return res.redirect('/');
    }

    // Gets string param in route, put it in a local variable
    let errorMessage = req.query.message;
    return res.render("users/registration", {
        message: errorMessage
    })
}

// Action to handle registration of a new user
exports.post_new_user = (req, res) => {

    const { firstName, secondName, organisation, number, email, password } = req.body;

    let confirmPassword = req.body.password2;


    source = 'registration';

    if (!email || !password) {
        res.status(401).send('No username or password.');
        return;
    }


    if (password != confirmPassword) {
        return res.render("users/registration", {
            message: "Error: Passwords must match."
        })
    }

    userDAO.lookupEmail(email, (err, u) => {
        if (u) {
            res.status(401).send("User exists: " + email);
            return;
        }

        userDAO.create(firstName, secondName, organisation, number, email, password, source);

        // This will only be reached if the user does not exist, so no headers have been sent yet
        res.redirect('/login');
    })
}

exports.login_get = (req, res) => {

    if (req.isLoggedIn) {
        return res.redirect('/');
    }

    let message = req.session.errorMessage;
        
    req.session.errorMessage = null;


    // Correct the syntax error here
    res.render('users/login', {
        errorMessage: message

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

