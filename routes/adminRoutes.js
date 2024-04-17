
// Import express so we can use Router() class
const express = require('express');

// Create instance of router class
const router = express.Router();

// Allow access to controller functions
const adminController = require('../controllers/adminController.js');

// Import auth module
const auth = require('../auth/auth.js');

// Admin redirection
router.get('/', auth.verifyAdmin, adminController.admin_page);  


module.exports=router;