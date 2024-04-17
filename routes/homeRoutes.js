// This handles routing

// Import actual login function
const {login} = require('../auth/auth.js');

const {verify} = require('../auth/auth.js');


// Import express so we can use Router() class
const express = require('express');

// Create instance of router class
const router = express.Router();

// Allow access to controller functions
const homeController = require('../controllers/homeController.js');


// Express will excecute controller action from controller object
router.get('/', verify, homeController.landing_page);

// Router class redirect HTTP GET request to '/about' endpoint
// Express will execute 'about_res' function from controller object
router.get('/about', homeController.about_res);

// Handling user registration
router.get('/registration', verify, homeController.registration_get);
router.post('/registration', homeController.post_new_user);

// Handling user login
router.get('/login', verify, homeController.login_get);
router.post('/login',login, homeController.login_post);

// Logout
router.get('/logout',  homeController.logout);



// Allows index.js to have access to defined routes
module.exports = router;
