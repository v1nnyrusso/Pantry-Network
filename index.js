// Import express framework into node.js app index.js
const express = require('express');

const session = require('express-session');



// Used to store env variables
require('dotenv').config()

const cookieParser = require('cookie-parser');

// get engine from express-handlebars
const {engine} = require('express-handlebars');

// New local variable to = express framework to create express application
const app = express();

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if your using https
}));

// Used to parse cookies
app.use(cookieParser());


// Set the view engine to handlebars
app.set('view engine', 'handlebars');

// Set handlebars configurations 
app.engine('handlebars', engine({
    layoutsDir: __dirname + '/views/layouts'
}))

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


// Rerouters for different endpoints
app.use('/', homeRoutes);
app.use('/admin', adminRoutes);
app.use('/donate', donateRoutes);


// Listens for port 3000, log to console that msg for success
app.listen(3000, () => {
    console.log('Server started on port 3000. Ctrl^c to quit.');
})


