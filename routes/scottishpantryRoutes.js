// This handles routing

// Import actual login function
const {login} = require('../auth/auth');

const {verify} = require('../auth/auth');

const {verifyAdmin} = require('../auth/auth');

// Import express so we can use Router() class
const express = require('express');

// Create instance of router class
const router = express.Router();

// Allow access to controller functions
const homeController = require('../controllers/homeController.js');

const adminController = require('../controllers/adminController.js');


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
router.get('/logout', homeController.logout);

// Admin redirection
router.get('/admin', verifyAdmin, adminController.admin_page);  


// Home Controller End >>>///

// 404 not found to return response to error
router.use((req,res) =>{
    res.status(404);
    res.type('text/plain');
    res.send('404 Not found.');
})

// Internal server error response
router.use((err,req,res,next) => {


    res.status(500);
    res.type('text/plain');
    res.send('Internal Server Error');
})


// Allows index.js to have access to defined routes
module.exports = router;
