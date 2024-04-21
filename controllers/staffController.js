// Import models
const productDAO = require("../models/productModel");
const donationDAO = require("../models/donationModel");
const pantryDAO = require("../models/pantryModel");
const userDAO = require("../models/userModel");

// Get the staff page
exports.staff_page = async (req, res) => {
    // If the user is not logged in, redirect to login
    if (!req.session.user || !req.session.user.id) {
        return res.redirect('/login');
    }

    // Check if user is not a staff
    if (req.session.role !== 'staff') {
        return res.redirect('/');
    }

    // Get the error message from the session
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;

    // Get the success message from the session
    let successMessage = req.session.successMessage;
    req.session.successMessage = null;

    // Get the current staff's pantry id
    let pantryId = req.session.pantryId;
    console.log('Pantry ID:', pantryId);

    // If there is no pantry id, return an error
    if (!pantryId) {
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

        // Remove the added product from the product list
        let productIndex = products.findIndex(product => claims.some(claim => claim.donationLineId === product.donationLineId));
        if (productIndex !== -1) {
            products.splice(productIndex, 1);
        }

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
                    claimed: claims.some(claim => claim.donationLineId === product.donationLineId)
                };
            }),
            // Get success messages and pantry name
            successMessage: successMessage,
            errorMessage: errorMessage,
            pantry: pantryName
        });
    } catch (error) {
        console.error("Error getting products:", error);
        return res.status(500).send('Error getting products');
    }
};

// Mark received method
exports.markReceived = async (req, res) => {
    console.log('Marking received');
    try {
        // Get the donation line id from the request body
        const { donationLineId } = req.body;

        // Get the current staff's pantry id
        let pantryId = req.session.pantryId;

        console.log('Pantry ID:', pantryId);
        console.log('Donation Line ID:', donationLineId);
        // If there is no pantry id, return an error
        if (!pantryId) {
            return res.status(500).send('Error getting pantry');
        }

        // Get the donations by pantry id
        let donations = await donationDAO.getDonations();

        // Check if there are donations
        if (!donations) {
            return res.status(500).send('Error getting donations');
        }

        // For each donation
        for (let donation of donations) {
            // If the donation pantry id matches the current pantry id and the donation line id matches the donation line id
            if (donation.pantryId === pantryId && donation.products.find(p => p.donationLineId === donationLineId)) {
                // For each donation product
                for (let donationProduct of donation.products) {
                    // If the donation line id matches the donation line id
                    if (donationProduct.donationLineId === donationLineId) {
                        // Update the donation product status to received
                        donationProduct.status = 'received';
                        // Update the donation line
                        await donationDAO.updateDonationLine(donation._id, donationLineId, donationProduct);
                        break;
                    }
                }
            }
        }

        // Set a success message
        req.session.successMessage = "Marked received successfully!";
        let successMessage = req.session.successMessage;
        req.session.successMessage = null;

        // Render the staff page
        res.render('staff/claimed', {
            title: 'Claimed Page',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            successMessage: successMessage,
            role: req.session.role,
            claimedDonations: await getClaimedDonations(pantryId)
        });

    } catch (err) {
        console.error("Error marking received:", err);
        res.status(500).send("Error marking received");
    }
}

// Reject claim method
exports.rejectClaim = async (req, res) => {
    try {
        // Get the donation line id from the request body
        const { donationLineId } = req.body;

        // Get the current staff's pantry id
        let pantryId = req.session.pantryId;

        // If there is no pantry id, return an error
        if (!pantryId) {
            return res.status(500).send('Error getting pantry');
        }

        // Get the donations by pantry id
        let donations = await donationDAO.getDonations();

        console.log('Donations:', donations);

        // Check if there are donations
        if (!donations) {
            return res.status(500).send('Error getting donations');
        }

        // For each donation
        for (let donation of donations) {
            // If the donation pantry id matches the current pantry id and the donation line id matches the donation line id
            if (donation.pantryId === pantryId && donation.products.find(p => p.donationLineId === donationLineId)) {
                // For each donation product
                for (let donationProduct of donation.products) {
                    // If the donation line id matches the donation line id
                    if (donationProduct.donationLineId === donationLineId) {
                        // Update the donation product status to rejected
                        donationProduct.status = 'rejected';
                        // Set isClaimed to false
                        donationProduct.isClaimed = false;
                        // Update the donation line
                        await donationDAO.updateDonationLine(donation._id, donationLineId, donationProduct);
                        break;
                    }
                }
            }
        }
        req.session.successMessage = "Claim rejected successfully!";
        let successMessage = req.session.successMessage;
        req.session.successMessage = null;

        // Render the staff page
        res.render('staff/claimed', {
            title: 'Claimed Page',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            successMessage: successMessage,
            role: req.session.role,
            claimedDonations: await getClaimedDonations(pantryId)
        });

    } catch (err) {
        console.error("Error rejecting claim:", err);
        res.status(500).send("Error rejecting claim");
    }
}
exports.claimed_page = async (req, res) => {
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

    // Get the pantry based on pantry id
    let pantry = await pantryDAO.getPantryById(pantryId);

    // Get pantry name
    pantryName = pantry.pantryName;

    // If there is no pantry id, return an error
    if (!pantryId) {
        return res.status(500).send('Error getting pantry');
    }

    let claimedDonations = await getClaimedDonations(pantryId);
    
    // Sort claimedDonations so that the claimed products with the status 'claimed' appear first in the list
    claimedDonations.sort((a, b) => {
        let statusA = a.products[0].status;
        let statusB = b.products[0].status;
        if (statusA === 'claimed' && statusB !== 'claimed') {
            return -1;
        } else if (statusA !== 'claimed' && statusB === 'claimed') {
            return 1;
        }
        return 0;
    });

    res.render('staff/claimed', {
        title: "Claimed Page",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
        isAdminPage: false,
        role: req.session.role,
        successMessage: successMessage,
        claimedDonations: claimedDonations,
        pantry: pantryName
    });
}


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

        // Filter products to remove the claimed product
        req.session.products = (await getProductFiltered(pantryId)).filter(product => product.donationLineId !== donationLineId);

        // Set a success message
        req.session.successMessage = "Claim added successfully!";

        return res.redirect('/staff');
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
        req.session.errorMessage = "Error: No claims to make!";
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
                    } else {
                        // If the quantity is 0, return a stock error
                        if (product.quantity === 0) {
                            req.session.errorMessage = "No stock for " + product.productName;
                            return res.redirect('/staff');
                        }
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
                                        product.isClaimed = true;
                                        product.status = 'claimed';
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
    products = products.filter(product => product && !product.isClaimed && product.expiry && new Date(product.expiry) > new Date() && product.status === 'pending');

    // Update expired products to "rejected"
    const expiredProducts = products.filter(product => new Date(product.expiry) < new Date());
    for (const product of expiredProducts) {
        await donationDAO.updateDonationLineStatus(pantryId, product.donationLineId, "rejected");
    }

    // Return the products
    return products;
}

// Create a function to get all claimed donations with user information
async function getClaimedDonations(pantryId) {
    try {
        // Get donations by pantryId
        let donations = await donationDAO.getDonationById(pantryId);

        // Filter out donations with claimed products
        let claimedDonations = donations.filter(donation => {
            return donation.products && donation.products.some(product => product.isClaimed);
        });

        // Iterate over each claimed donation
        for (let donation of claimedDonations) {
            // Filter out unclaimed products
            donation.products = donation.products.filter(product => product.isClaimed);

            // Get user information for each claimed product
            for (let product of donation.products) {
                if (product.isClaimed) {
                    product.stockLevel = product.quantity;

                    // Get user that donated the product
                    let userDonationId = await userDAO.getUserById(donation._id);
                    // Get the user
                    let user = await userDAO.getUserById(userDonationId.userId);

                    console.log('User:', user);

                    console.log('Pantry:', product.pantry);

                    // Set the donated by user to the user's name if it exists, otherwise set to unknown 
                    product.donatedByUser = user ? user : "Unknown";
                    console.log('product:', product.donationLineId, product.donatedByUser);
                }
            }
        }

        // Log the claimed donations
        console.log('Claimed donations:', claimedDonations);

        // Return the claimed donations
        return claimedDonations;

    } catch (error) {
        console.error("Error getting claimed donations:", error);
        throw error;
    }
}
