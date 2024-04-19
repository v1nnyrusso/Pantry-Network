const productDAO = require("../models/productModel");

const donationDAO = require("../models/donationModel");


// Get the staff page
exports.staff_page = async (req, res) => {

     // Get the current staffs pantry id
     let pantryId = req.session.pantryId;

     console.log('Pantry ID:', pantryId);

    // Use a function for better readability and modularity
    getProductFiltered(pantryId).then(products => {
        // Render the staff page
        return res.render('staff/staffhub', {
            title: "Staff Page",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isAdminPage: false,
            role: req.session.role,
            products: products,
        });
    });

}

// Add to cart method
exports.addToCart = async (req, res) => {
   
     // Get the current staffs pantry id
     let pantryId = req.session.pantryId;

    // Assuming staff members are managing products
    const { productId, qty, expiry, productName } = req.body;
    try {

        console.log('Adding product:', productId, qty, expiry, productName);
        // Add the claim to the session
        req.session.claims = req.session.claims || [];
        // Add the claim to the session
        req.session.claims.push({ productId, qty, expiry, productName});

        // Set a success message
        console.log('Claim added successfully!', req.session.claims);

        req.session.successMessage = "Claim added successfully!";
        const successMessage = req.session.successMessage;
        req.session.successMessage = null;

        return res.render('staff/staffhub', {
            title: 'Manage Products',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            successMessage: successMessage,
            products: await getProductFiltered(pantryId),
            role: req.session.role,
      
        });
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).send('Error adding product');
    }

};

// Get the data from the session and render the donateCart page
exports.getCart = async (req, res) => {

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

    // Get the user id from the session
    let userId = req.userId;

    // Create a new donation
    let claim = {
        userId: userId,
        products: claims
    };

    console.log('Claim:', claim);

    // Clear the claims from the session
    req.session.claims = [];

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
    products = products.filter(product => product &&  product.status === 'pending' && product.expiry && new Date(product.expiry) > new Date());

    // Return the products
    return products;
}

