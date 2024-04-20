// Import models
const productDAO = require("../models/productModel");
const donationDAO = require("../models/donationModel");

const pantryDAO = require("../models/pantryModel");

// Get the staff page
exports.staff_page = async (req, res) => {

    if (!req.session.user || !req.session.user.id) {
        return res.redirect('/login');
    }

    if (req.session.role !== 'staff') {
        return res.redirect('/');
    }

    // Get the success message from the session
    let successMessage = req.session.successMessage;
    req.session.successMessage = null;


    // Get the current staff's pantry id
    let pantryId = req.session.pantryId;

    // If there is no pantry id, return an error
    if(!pantryId){
        return res.status(500).send('Error getting pantry');
    }

    // Get the pantry based on pantry id
    let pantry = await pantryDAO.getPantryById(pantryId);

    // Get pantry name
    pantryName = pantry.pantryName;

    try {
        // Use a function for better readability and modularity
        const products = await getProductFiltered(pantryId);
        const claims = req.session.claims || [];
        // Render the staff page
        return res.render('staff/staffhub', {
            title: "Staff Page",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isAdminPage: false,
            role: req.session.role,
            // If at least one claim exists where the product id matches the claim product id, set claimed to true, otherwise false
            products: products.map(product => {
                return {
                    ...product,
                    claimed: claims.some(claim => claim.productId === product.productId)
                };
            }),
            // Get success messages and pantry name
            successMessage: successMessage,
            pantry: pantryName
        });
    } catch (error) {
        console.error("Error getting products:", error);
        return res.status(500).send('Error getting products');
    }
};


// Add to cart method
exports.addToCart = async (req, res) => {

    // Get the current staff's pantry id
    let pantryId = req.session.pantryId;

    // Assuming staff members are managing products
    const { donationLineId, productId, qty, expiry, productName } = req.body;
    try {

        console.log('Adding product:', donationLineId, productId, qty, expiry, productName);
        // Add the claim to the session
        req.session.claims = req.session.claims || [];
        // Add the claim to the session
        req.session.claims.push({ donationLineId, productId, qty, expiry, productName, isClaimed: true });

        // Set a success message
        console.log('Claim added to cart!', req.session.claims);

        req.session.successMessage = "Claim added successfully!";
        const successMessage = req.session.successMessage;
        req.session.successMessage = null;

        return res.render('staff/staffhub', {
            title: 'Manage Products',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            successMessage: successMessage,
            // Map through the products and claims, if the product id matches the claim product id, set claimed attribute to true, otherwise false
            products: (await getProductFiltered(pantryId)).map(product => {
                return {
                    ...product,
                    claimed: product.productId === productId ? true : false
                };
            }),
            role: req.session.role,
        });
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).send('Error adding product');
    }

};

// Get the data from the session and render the donateCart page
exports.getCart = async (req, res) => {


    if (!req.session.user || !req.session.user.id) {
        return res.redirect('/login');
    }

    // Check if user is logged in and a staff member
    if (req.session.role !== 'staff') {
        return res.redirect('/');
    }

    // Get error message from session, clear it
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    // Get pantriees

    // If the user is not logged in, redirect to login
    if (!req.session.user || !req.session.user.id) {
        return res.redirect('/login');
    }

    // Check if user is logged in and not an admin
    if (req.session.role === 'admin') {
        console.log('Role:', req.session.role)
        return res.redirect('/');
    }

    // If there are no claims in the session, initialise an empty array
    if (!req.session.claims) {
        req.session.claims = [];
    }

    res.render('donation/cart', { claims: req.session.claims, user: req.session.user, isLoggedIn: req.isLoggedIn, title: 'Cart', role: req.session.role, isCartPage: true });
}

// Make the claim method
exports.makeClaim = async (req, res) => {
    // Get the claims from the session
    let claims = req.session.claims;

    // If there are no claims, redirect to the staff page
    if (!claims || claims.length === 0) {
        return res.redirect('/staff');
    }

    try {

        // Get the products from the pantry
        let products = await getProductFiltered(req.session.pantryId);

        // For each product in the pantry
        for (let product of products) {

            // For each claim in the session
            for (let claimProduct of claims) {

                // If the donation line id matches
                if (product.donationLineId == claimProduct.donationLineId) {

                    // And if the quantity is less than the claim quantity, return a stock error
                    if (product.quantity < claimProduct.qty) {
                        req.session.errorMessage = "Not enough stock for " + product.productName;
                        return res.redirect('/staff');
                    }
                    // Else, continue
                    else {

                        // If the quantity is 0, return a stock error
                        if (product.quantity === 0) {
                            req.session.errorMessage = "No stock for " + product.productName;
                            return res.redirect('/staff');
                        }

                        // Update the product quantity
                        product.quantity -= claimProduct.qty;

                        // Get all donations
                        let donations = await donationDAO.getDonations();

                        // For each donation
                        for (let donation of donations) {

                            // if the donation pantry id matches the current pantry id and the donation line id matches the claim product donation line id and exists in the donations products
                            if (donation.pantryId === req.session.pantryId && donation.products.find(p => p.donationLineId === claimProduct.donationLineId)) {

                                // For each donation product
                                for (let donationProduct of donation.products) {

                                    // If the donation line id matches the claim product donation line id
                                    if (donationProduct.donationLineId === claimProduct.donationLineId) {

                                        // Update the donation product quantity and set isClaimed to true 
                                        donationProduct.isClaimed = true;
                                        donationProduct.quantity = product.quantity;

                                        // Update the donation line, send the donation id, donation line id and the product
                                        await donationDAO.updateDonationLine(donation._id, claimProduct.donationLineId, product);


                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // Catch any errors
    } catch (error) {
        console.error("Error making claim:", error);
        req.session.errorMessage = "An error occurred while making the claim.";
        return res.redirect('/staff');
    }

    // Clear the claims from the session
    req.session.claims = [];

    req.session.successMessage = "Claim made successfully!";
    // Redirect to the staff page
    res.redirect('/staff');
}

// Create a function for this as it will get used a lot
async function getProductFiltered(pantryId) {

    // Get donations by pantryId
    let donations = await donationDAO.getDonationById(pantryId);

    // Get products from donations
    let products = donations.map(donation => donation.products).flat();

    // If the product exists, product.expiry is a valid date and the expiry date is greater than the current date
    // And the status is pending, add to products list
    products = products.filter(product => product && !product.isClaimed && product.expiry && new Date(product.expiry) > new Date());

    // Return the products
    return products;
}

