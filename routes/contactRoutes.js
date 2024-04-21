// Import express so we can use Router() class
const express = require('express');

// Create instance of router class
const router = express.Router();


// Import auth module
const auth = require('../auth/auth.js');

const homeController = require('../controllers/homeController')

router.get('/', auth.verify, homeController.getContactPage)
router.post('/',auth.verify, homeController.postContactForm)

//Export
module.exports=router;
