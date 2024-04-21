
const userDAO = require('../models/userModel.js');
const productDAO = require('../models/productModel.js');
const pantryDAO = require('../models/pantryModel.js');
const contactDAO = require('../models/contactModel.js');

// Get to admin page
exports.admin_page = (req, res) => {

    // if appropriate user is logged in, render admin page
    if (req.payload && req.isLoggedIn) {
        res.render('admin/adminhub', {
            title: "Admin Page",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isAdminPage: true,
            role: req.session.role
        })
    }
    else {
        res.redirect('/login');
    }

}

// Get to staff page
exports.staff_page = async (req, res) => {

    // Get all staff if appropriate user is logged in
    try {
        if (req.payload && req.isLoggedIn) {
            let type = 'staff';
            // Get usesr based on role type
            const users = await userDAO.getUsers(type)
  
            // Get pantry name for each user
            for (let user of users) {
                let pantry = await pantryDAO.getPantryById(user.pantryId);
                user.pantry = pantry.pantryName;
            }

            res.render('admin/adminStaff', {
                title: "Staff Page",
                isLoggedIn: req.isLoggedIn,
                user: req.session.user,
                isAdminPage: true,
                role: req.session.role,
                staff: users
            })
        }
        // Else, redirect user to login
        else {
            res.redirect('/login');
        }
    }
    // Catch error
    catch (e) {
        console.error('Error getting staff:', e)
    }

}



// Create staff
exports.create_staff_get = async (req, res) => {

    // Error message from session and success message handling
    successMessage = req.session.successMessage
    req.session.successMessage = null;
    errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;

    // Check if user is logged in
    if (req.payload && req.isLoggedIn) {
        res.render('admin/createStaff', {
            title: "Create Staff",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isAdminPage: true,
            role: req.session.role,
            message: errorMessage,
            successMessage: successMessage,
            pantries: await pantryDAO.getAllPantries()
        })
    }
    else {
        res.redirect('/login');
    }

}

exports.create_staff_post = async (req, res) => {
    // Get the data from the request body
    let { firstName, secondName, organisation, number, password, email } = req.body;

    let pantry = organisation;

    
    // Capitalise the first letter of the first and last name
    firstName = capitaliseFirstLetter(firstName);
    secondName = capitaliseFirstLetter(secondName);
    email = email.toLowerCase();

    // Get the confirm password from the request body
    let confirmPassword = req.body.password2;

    // Set the source of the user to be from registration to decipher role in create method
    source = 'staff';

    // If email or password is somehow missing, send a 401 status code
    if (!email || !password) {

        res.status(401).send('No username or password.');
        return;
    }

    // Check if the phone number is 11 digits
    if (number.length > 11 || number.length < 11 || isNaN(number)) {
        console.log("Error: Phone number must be 11 digits.")
        message = "Error: Phone number must be 11 digits."
        return res.render("admin/createStaff", {
            message: message
        });
    }

    // If the passwords dont match, rerender and send error message
    if (password != confirmPassword) {
        return res.render("admin/createStaff", {
            message: "Error: Passwords must match."
        })
    }

    // Lookup user by email tom make sure they dont exist
    userDAO.lookupEmail(email, (err, u) => {
        if (u) {

            // Set error message in session
            req.session.errorMessage = "Error: User " + email + " exists. Please login.";

            // Return to login as they exist
            return res.redirect('create');
        }


        console.log("Creating user: ", firstName, secondName, organisation, number, email, password, pantry, source);
        // Use userDAO create method to create a new
        let staffId = userDAO.create(firstName, secondName, organisation, number, email, password, pantry, source);

        req.session.successMessage = "User " + email + " created successfully.";
        // Return to login as they exist
        return res.redirect('create');


    });

}


// Get the product page
exports.product_page = async (req, res) => {

    try {
        // Get all products
        const products = await productDAO.getProducts();

        // Check if user is logged in
        if (req.payload && req.isLoggedIn) {
            res.render('admin/adminProducts', {
                title: "Products",
                isLoggedIn: req.isLoggedIn,
                user: req.session.user,
                isAdminPage: true,
                role: req.session.role,
                products: products
            })
        }
        else {
            res.redirect('/login');
        }

    }
    catch (e) {
        console.error('Error getting products:', e)
    }


}

// Get the update product page
exports.create_product_get = (req, res) => {

    // Error message from session and success message handling
    successMessage = req.session.successMessage
    req.session.successMessage = null;
    errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;

    // Check if user is logged in
    if (req.payload && req.isLoggedIn) {
        res.render('admin/createProduct', {
            title: "Create Product",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isAdminPage: true,
            role: req.session.role,
            message: errorMessage,
            successMessage: successMessage
        })
    }
    else {
        res.redirect('/login');
    }


}

// Create a product post    
exports.create_product_post = async (req, res) => {

    // Get the data from the request body
    let { productName, typeOfProduct, currentStock, expiry } = req.body;

    let categories = [req.body.categories];

    // Make it an int
    currentStock = parseInt(currentStock);

    // Capitalise the first letter of the category and split them
    categories = categories.map(category => {

         category.includes(", ") ? category.split(", ") : category;
         return capitaliseFirstLetter(category);

    });

    // Capitalise the first letter of the first and last name
    productName = capitaliseFirstLetter(productName);
    typeOfProduct = capitaliseFirstLetter(typeOfProduct);

    // If email or password is somehow missing, send a 401 status code
    if (!productName || !typeOfProduct || !currentStock || !categories || categories.length == 0) {

        req.session.errorMessage = "Error: Please fill in all fields.";

        res.render('admin/createProduct', {
            title: "Create Product",
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            isAdminPage: true,
            role: req.session.role,
            message: req.session.errorMessage
        });

    }
    try {

        // See if product exists
        const product = await productDAO.lookupProduct(productName);
        
        if (product) {
            req.session.errorMessage = "Error: Product already exists";
            errorMessage = req.session.errorMessage;
            req.session.errorMessage = null
            return res.render('admin/createProduct', {
                title: "Create Product",
                isLoggedIn: req.isLoggedIn,
                user: req.session.user,
                isAdminPage: true,
                role: req.session.role,
                message: errorMessage,
                errorMessage: errorMessage

            })

        } else {

            // Create the product
            productDAO.create(productName, typeOfProduct, currentStock, categories, expiry);
           
            // Set success message
            req.session.successMessage = "Success: Created product!"
            successMessage = req.session.successMessage;
            req.session.successMessage = null;

            // Render the page
            res.render('admin/createProduct', {
                title: "Create Product",
                isLoggedIn: req.isLoggedIn,
                user: req.session.user,
                isAdminPage: true,
                role: req.session.role,
                successMessage: successMessage
            });
           
        }
    } catch (error) {
        // Error occurred while looking up the product
        console.error("Error occurred:", error);
    }

}

exports.contact_page = async (req, res) => {
    try {
        // Get all products
        let messages = await contactDAO.getMessages();

        // Sort messages by unread status and date submitted
        messages.sort((a, b) => {
            if (a.status === "unread" && b.status !== "unread") {
                return -1;
            }
            if (a.status !== "unread" && b.status === "unread") {
                return 1;
            }
            // If both are unread or both are read, sort by date submitted
            return new Date(b.dateSubmitted) - new Date(a.dateSubmitted);
        });

        // Check if user is logged in
        if (req.payload && req.isLoggedIn) {
            res.render('admin/adminContacts', {
                title: "Messages",
                isLoggedIn: req.isLoggedIn,
                user: req.session.user,
                isAdminPage: true,
                role: req.session.role,
                contacts: messages
            });
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.error('Error getting messages:', e);
    }
};



exports.search_messages = async (req, res) => {
    // Search for messages by email
    try {

        // Get the email from the query
        const { email } = req.query;
        const messages = await contactDAO.searchMessagesByEmail(email);

        if (req.payload && req.isLoggedIn) {
            res.render('admin/adminContacts', {
                title: "Messages",
                isLoggedIn: req.isLoggedIn,
                user: req.session.user,
                isAdminPage: true,
                role: req.session.role,
                contacts: messages
            });
        }
        else {
            res.redirect('/login');
        }
    }
    catch (e) {
        console.error('Error searching messages:', e);
    }
}




// Delete
exports.delete = async (req, res) => {

    // Get the id from the request body
    let id = req.body.id;

    // Get the source from the request body
    let source = req.body.source;

    // Depending on source call approprite delete method
    switch (source) {
        case 'staff':
            await userDAO.deleteUser(id);
            await res.redirect('/admin/staff');
            break;
        case 'product':
            await productDAO.deleteProduct(id);
            await res.redirect('/admin/product');
            break;
        case 'contact':
            await contactDAO.deleteMessage(id);
            await res.redirect('/admin/contact');
            break;
        default:
    }

}

exports.markRead = async (req, res) => {

    // Get the id from the request body
    let id = req.body.id;

    // Mark the message as read
    await contactDAO.markRead(id);

    // Redirect to the contact page
    await res.redirect('/admin/contact');

}

// Capitalise the first letter of a string
function capitaliseFirstLetter(string) {
    if (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    else {
        return console.error("Error: String is null")
    }

}