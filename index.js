// Import express framework into node.js app index.js
const express = require('express');

const session = require('express-session');



// Used to store env variables
require('dotenv').config()

// Import cookie parser
const cookieParser = require('cookie-parser');

// Import handlebars
const expressHandlebars = require('express-handlebars');

// New local variable to = express framework to create express application
const app = express();

// Use session middleware to store user data between requests
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

// Used to parse cookies
app.use(cookieParser());


// Create handlebars engine, set views directory to views/layouts, create helper function for ifEquals
const hbs = expressHandlebars.create({
  layoutsDir: __dirname + '/views/layouts',
  helpers: {
    ifEquals: function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
  }
});

// Make express use the handlebars engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


// Import path module into app
const path = require('path');

// Construct absolute path to directory public
const public = path.join(__dirname, 'public');

// Mount middleware function at public path to serve static files
// Takes public as argument (directory path) when files are requested from the server
app.use(express.static(public));


// Parse incoming requests before handling
// Tells express app to use body-parser middleware to handle form POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));


// Import routes for code modularity and readability
const homeRoutes = require('./routes/homeRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const donateRoutes = require ('./routes/donateRoutes.js');
const staffRoutes = require('./routes/staffRoutes.js');


// Rerouters for different endpoints
app.use('/', homeRoutes);
app.use('/admin', adminRoutes);
app.use('/donate', donateRoutes);
app.use('/staff', staffRoutes);


// Listens for port 3000, log to console that msg for success
app.listen(3000, () => {
    console.log('Server started on port 3000. Ctrl^c to quit.');
})


