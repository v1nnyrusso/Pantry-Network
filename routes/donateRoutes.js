
// Import express so we can use Router() class
const express = require('express');

// Create instance of router class
const router = express.Router();

// Import controller functions
const donateController = require('../controllers/donateController.js');

// Need this to ensure the donator is logged in
const {verify, verifyDonator} = require('../auth/auth.js'); 


router.get('/', verifyDonator, donateController.donate_home);
router.post('/', verifyDonator, donateController.donate);


module.exports = router;
