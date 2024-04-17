const userDAO = require('../models/userModel.js');
const donationDAO = require('../models/donationModel.js');
const pantryDAO = require('../models/pantryModel.js');


exports.donate_home = async (req, res) => {

    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    // Get all necessary information
    try {
        const [pantries, items] = await Promise.all([
            pantryDAO.getAllPantries(),
            donationDAO.getItemsNeeded()
        ]);

        res.render('donation/donateHome', { pantries, foodItems: items });
    } catch (err) {
        console.error('Error:', err);
        res.render('donation/donateHome', { errorMessage: 'An error occurred' });
    }

}