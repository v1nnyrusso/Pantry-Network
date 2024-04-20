

const donateController = require('../controllers/donateController.js');

// Import express so we can use Router() class
const express = require('express');

// Create instance of router class
const router = express.Router();

// Allow access to controller functions
const staffController = require('../controllers/staffController.js');

// Import auth module
const auth = require('../auth/auth.js');

router.get('/', auth.verifyStaff, staffController.staff_page);
router.post('/', auth.verifyStaff, staffController.addToCart);

router.get('/cart', auth.verifyStaff, staffController.getCart);
router.post('/cart', auth.verifyStaff, staffController.makeClaim);

router.get('/claimed', auth.verifyStaff, staffController.claimed_page);




module.exports = router;