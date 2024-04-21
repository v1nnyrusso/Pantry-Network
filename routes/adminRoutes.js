
// Import express so we can use Router() class
const express = require('express');

// Create instance of router class
const router = express.Router();

// Allow access to controller functions
const adminController = require('../controllers/adminController.js');

const homeController = require('../controllers/homeController.js');

// Import auth module
const auth = require('../auth/auth.js');

// Admin redirection
router.get('/', auth.verifyAdmin, adminController.admin_page);  
// Staff redirection
router.get('/staff', auth.verifyAdmin, adminController.staff_page);

// Staff creation page
router.get('/staff/create', auth.verifyAdmin, adminController.create_staff_get);
router.post('/staff/create', auth.verifyAdmin, adminController.create_staff_post);
// Staff deletion 
router.post('/staff/delete', auth.verifyAdmin, adminController.delete);



router.get('/product', auth.verifyAdmin, adminController.product_page);
router.get('/product/create', auth.verifyAdmin, adminController.create_product_get);

router.post('/product/create', auth.verifyAdmin, adminController.create_product_post);
router.post('/product/delete', auth.verifyAdmin, adminController.delete);

router.get('/contact', auth.verifyAdmin, adminController.contact_page);
router.post('/contact/delete', auth.verifyAdmin, adminController.delete);

// Mark as read
router.post('/contact/markread', auth.verifyAdmin, adminController.markRead);

router.get('/contact/search', auth.verifyAdmin, adminController.search_messages);




module.exports=router;