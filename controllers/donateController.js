// Imports
const pantryDAO = require('../models/pantryModel.js');
const productDAO = require('../models/productModel.js');
const userDAO = require('../models/userModel.js');
const donationDAO = require('../models/donationModel.js');

// Render the donateHome page, async as it uses await for db operations
exports.donate_home = async (req, res) => {

    try {
        // Check if user is logged in and a donator
        if (req.payload && req.isLoggedIn) {
            // Get pantry and donation items

            // Get all products
            const products = await productDAO.getProducts();

            // Sort in alphabetical order of type and product
            const productsByType = products.sort((a, b) => a.typeOfProduct.localeCompare(b.typeOfProduct));

            // Get error and success messages from session, clear them
            errorMessage = req.session.errorMessage;
            req.session.errorMessage = null;
            successMessage = req.session.successMessage;
            req.session.successMessage = null;
            // Render donateHome page with data
            return res.render('donation/donateHome', {
                title: 'Donate',
                isLoggedIn: req.isLoggedIn,
                user: req.session.user,
                isDonatePage: true,
                products: productsByType,
                categories: products.categories,
                role: req.session.user.role,
                successMessage: successMessage,
                errorMessage: errorMessage
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

// Add a product to the cart
exports.addToCart = async (req, res) => {

    // Local variables from the request body
    const { qty, expiry } = req.body;
    const [productId, productName] = req.body.product.split('_');

    // Validation checks
    if (!productId || !qty || !expiry || isNaN(qty) || expiry.length !== 10 || expiry < new Date().toLocaleDateString('en-GB')) {
        let errorMessage = '';
        if (!productId || !qty || !expiry) errorMessage = 'Error: All fields are required.';
        else if (isNaN(qty)) errorMessage = 'Error: Quantity must be a number.';
        else if (expiry.length !== 10) errorMessage = 'Error: Expiry date must be in the format dd/mm/yyyy.';
        else if (expiry.length < new Date().toLocaleDateString('en-GB')) errorMessage = 'Error: Expiry date cannot be in the past.';
        else {
            errorMessage = 'Error: Something went wrong. Please try again.';
        }

        // Return and repopulate the form with error message
        return res.render('donation/donateHome', {
            title: 'Donate',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isDonatePage: true,
            errorMessage,
            products: await productDAO.getProducts(),
        });
    }
    else {
        // Try add a donation to the cart
        try {


            // Add the donation to the session
            req.session.donations = req.session.donations || [];
            // Add the donation to the session
            req.session.donations.push({ productId, qty, expiry, productName});

            
            // Sort the products and pantries, await all promises, if any reject, catch block will handle it
            let [sortedProducts, sortedPantries] = await Promise.all([
                productDAO.getProducts().then(products => products.sort((a, b) => a.typeOfProduct.localeCompare(b.typeOfProduct))),
                pantryDAO.getAllPantries().then(pantries => pantries.sort((a, b) => a.pantryName.localeCompare(b.pantryName)))
            ]);
            
            // Set a success message
            req.session.successMessage = "Donation added to cart successfully!"
            successMessage = req.session.successMessage;
            req.session.successMessage = null;
            console.log('Added to cart:', req.session.donations);

            return res.render('donation/donateHome', {
                title: 'Donate',
                isLoggedIn: req.isLoggedIn,
                user: req.session.user,
                role: req.session.user.role,
                isDonatePage: true,
                products: sortedProducts,
                pantries: sortedPantries,
                successMessage: successMessage
            });

        }

        // Display any errors
        catch (error) {
            console.error('Error adding to cart:', error);
            return res.status(500).send('Error adding to cart');

        }

    }

}
// Remove a product from the cart
exports.removefromCart = async (req, res) => {
    try {
        // Get the product id from the params
        const { productId } = req.params;

        // Remove the product from the session
        req.session.donations = req.session.donations || [];
        req.session.donations = req.session.donations.filter(donation => donation.productId !== productId);

        console.log('Removed from cart:', req.session.donations);
        return res.redirect('/donate/cart');
    }
    catch (e) {
        console.error('Error removing from cart:', e);
        return res.status(500).send('Error removing from cart');
    }


}

// Get the data from the session and render the donateCart page
exports.getCart = async (req, res) => {

    // Get error message from session, clear it
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    // Get pantries
    const pantries = await pantryDAO.getAllPantries();

     // If the user is not logged in, redirect to login
     if (!req.session.user || !req.session.user.id) {
        return res.redirect('/login');
    }

    // Check if user is logged in and a donator
    if (req.session.role === 'admin') {
        console.log('Role:', req.session.role)
        return res.redirect('/');
    }

   
    // If there are no donations in the session, initialise an empty array
    if (!req.session.donations) {
        req.session.donations = [];
    }

    // Render donateCart page with data
    res.render('donation/cart', { donations: req.session.donations, user: req.session.user, isLoggedIn: req.isLoggedIn, title: 'Cart', role: req.session.role, isCartPage: true, pantries: pantries });
}


exports.donate = async (req, res) => {

    // Get the data from the session
    const donations = req.session.donations || [];

    if (donations.length === 0) {
        req.session.errorMessage = 'Error: No donations in basket. Please add products.';
        return res.redirect('/donate');
    }
    // And the boidy
    const pantry = req.body.pantry;

    // Initialise an array to store the products
    const products = [];

    // Get each product from the session and validate it
    donations.forEach(async (donation) => {

        // Get a product line id, make it random, but unique by using the current date millisecond and a random number
        // Rounded to nearest whole number, as a string for identification
        const donationLineId = Date.now() + Math.floor(Math.random() * 1000).toString();
        const productId = donation.productId;
        const productName = donation.productName;

        // Parse the quantity as an integer
        const quantity = parseInt(donation.qty);
        const expiry = donation.expiry || new Date().toLocaleDateString('en-GB');
        const status = 'pending';

        // Push each product to new array
        products.push({ donationLineId, productId, productName, quantity, expiry, status });

        // Update stock for each product
        productDAO.updateStock(productId, quantity);

        // Validation checks
        if (!productId || !quantity || !expiry || isNaN(quantity) || expiry.length !== 10 || expiry < new Date().toLocaleDateString('en-GB')) {
            console.error('Error: Invalid donation data');
            return res.status(400).send('Error: Invalid donation data');
        }
    });

    // Make new donation obj
    const donation = {
        dataStore: 'Donation',
        userId: req.session.user.id,
        pantryId: pantry,
        products: products,
        donationDate: new Date().toLocaleDateString('en-GB'),
    };

    // Try to make the donation, add it to user and pantry, update the stock and redirect to home
    try {
        const donationId = await donationDAO.makeDonation(donation);
        // await productDAO.updateStock(product, qty);
        await userDAO.addUserDonation(donationId, req.session.user.id);
        await pantryDAO.addDonationToPantry(pantry, donationId);
        console.log('Donation made successfully');
        req.session.donations = [];
        req.session.successMessage = 'Donation made successfully!';
        return res.redirect('/donate');
    } catch (err) {
        console.error('Error making donation or updating stock:', err);
        return res.status(500).send('Error making donation or updating stock');
    }
    

}

