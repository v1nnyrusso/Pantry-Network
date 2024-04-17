const userDAO = require('../models/userModel.js');
const donationDAO = require('../models/donationModel.js');
const pantryDAO = require('../models/pantryModel.js');
const user = require('../models/userModel.js');

exports.donate_home = async (req, res) => {
    try {
        // Check if user is logged in and a donator
        if (req.payload && req.isLoggedIn) {
            // Get pantry and donation items
            const pantries = await pantryDAO.getAllPantries();
            const items = await donationDAO.getItemsNeeded();

            // Render donateHome page with data
            return res.render('donation/donateHome', {
                title: 'Donate',
                isLoggedIn: req.isLoggedIn,
                user: req.name,
                isDonatePage: true,
                foodItems: items,
                pantries: pantries,
            });
        } else {
            // If user is not logged in, redirect to login page
            return res.redirect('../login');
        }
    } catch (error) {
        // Handle any errors
        console.error('Error in donate_home:', error);
        return res.status(500).send('Internal Server Error');
    }
};

exports.donate = async (req, res) => {
    const { pantry, name, qty, expiry } = req.body;


    // Check if expiry date is in the wrong format
    if(expiry.length !== 10){
        return res.render('donation/donateHome', {
            title: 'Donate',
            isLoggedIn: req.isLoggedIn,
            user: req.name,
            isDonatePage: true,
            errorMessage: 'Error: Expiry date must be in the format dd/mm/yyyy.',
            foodItems : await donationDAO.getItemsNeeded(),
            pantries : await pantryDAO.getAllPantries()
        });
    }

    // Check if expiry date is in the past
    if(expiry < new Date().toLocaleDateString('en-GB')){
        return res.render('donation/donateHome', {
            title: 'Donate',
            isLoggedIn: req.isLoggedIn,
            user: req.name,
            isDonatePage: true,
            errorMessage: 'Error: Expiry date cannot be in the past.',
            foodItems : await donationDAO.getItemsNeeded(),
            pantries : await pantryDAO.getAllPantries()
        });
    }
    
    // Check if any fields are empty, or if quantity is not a number
    if (!pantry || !name || !qty || isNaN(qty) ||!expiry) {

        // Check if quantity is not a number, takes priority over other checks
        if(isNaN(qty)){
            return res.render('donation/donateHome', {
                title: 'Donate',
                isLoggedIn: req.isLoggedIn,
                user: req.name,
                isDonatePage: true,
                errorMessage: 'Error: Quantity must be a number.',
                foodItems : await donationDAO.getItemsNeeded(),
                pantries : await pantryDAO.getAllPantries()
            });
        }

        return res.render('donation/donateHome', {
            title: 'Donate',
            isLoggedIn: req.isLoggedIn,
            user: req.name,
            isDonatePage: true,
            errorMessage: 'Error: All fields are required.',
            foodItems : await donationDAO.getItemsNeeded(),
            pantries : await pantryDAO.getAllPantries()
        });
    }
 
    const donation = {
        userId: req.userId,
        pantryId: pantry,
        name: name,
        quantity: qty,
        useByDate: expiry,
        status: 'pending',
        donationDate: new Date().toLocaleDateString('en-GB'),
    };

    donationDAO.makeDonation(donation)
        .then(() => {
            return res.redirect('/');
        })
        .catch(err => {
            console.error('Error making donation:', err);
            return res.status(500).send('Error making donation');
        });
};


