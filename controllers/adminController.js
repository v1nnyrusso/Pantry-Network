
const userDAO = require('../models/userModel.js');


// Get to admin page
exports.admin_page = (req, res) => {

    if(req.payload && req.isLoggedIn){
        res.send('<h1> Welcome to the admin page</h1>');
    }
    else{
        res.redirect('/login');
    }

}