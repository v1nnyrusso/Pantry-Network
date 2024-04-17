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
                type: items.typeOfItem,
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

    // Validation checks
    if (!name || !qty || !expiry || isNaN(qty) || expiry.length !== 10 || expiry < new Date().toLocaleDateString('en-GB')) {
        let errorMessage = '';
        if (!name || !qty || !expiry) errorMessage = 'Error: All fields are required.';
        else if (isNaN(qty)) errorMessage = 'Error: Quantity must be a number.';
        else if (expiry.length !== 10) errorMessage = 'Error: Expiry date must be in the format dd/mm/yyyy.';
        else errorMessage = 'Error: Expiry date cannot be in the past.';

        return res.render('donation/donateHome', {
            title: 'Donate',
            isLoggedIn: req.isLoggedIn,
            user: req.name,
            isDonatePage: true,
            errorMessage,
            foodItems: await donationDAO.getItemsNeeded(),
            pantries: await pantryDAO.getAllPantries()
        });
    }

    // Proceed with donation
    const [neededItem, typeOfItem] = name.split('_');

    // Make new donation obj
    const donation = {
        userId: req.userId,
        pantryId: pantry,
        name: neededItem,
        type: typeOfItem,
        quantity: qty,
        useByDate: expiry,
        status: 'pending',
        donationDate: new Date().toLocaleDateString('en-GB'),
    };

    // Try to make the donation, update the stock and redirect to home
    try {
        // Make a donation
        await donationDAO.makeDonation(donation);
        // Update the stock
        await donationDAO.updateStock(neededItem, qty);
        console.log('Donation made successfully');
        return res.redirect('/');
    } catch (err) {
        console.error('Error making donation:', err);
        console.error('Error updating stock:', err);
        return res.status(500).send('Error making donation and updating stock');
    }
};



