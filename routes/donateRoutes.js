
// Import express so we can use Router() class
const express = require('express');

// Create instance of router class
const router = express.Router();

// Import controller functions
const donateController = require('../controllers/donateController.js');

// Need this to ensure the donator is logged in
const {verify} = require('../auth/auth.js'); 


router.get('/', verify, donateController.donate_home);


module.exports = router;
