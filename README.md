README
Project Overview
This project is a web application for managing a food pantry. It includes features for handling donations, managing products, and user registration. The application is built using Node.js and Express, with data stored in a local nedb-gray database.

Features
There are three roles, donator, admin and staff.

Donator: Can create pending donations to staff by adding products to a cart and checking out

Staff: Can claim or reject pending donations, checking out in a similar basket but with claimed items. They can also mark items as claimed once the items have reached the pantry.

Admin: Admins can CRUD (create, read, update and delete) staff and products. They can also delete messages sent via contact form.

Unauthorised user: Can login, register and send in a contact form message, as well as peruse the website. All of the above can do this.

Directory Structure
auth/: Contains the authentication logic.
controllers/: Contains the controllers for handling different routes.
css/: Contains the CSS files for styling the application.
data/: Contains the database manager.
models/: Contains the data models for the application.
public/: Contains public assets like images and stylesheets.
routes/: Contains the route definitions for the application.
scripts/: Contains JavaScript scripts for the application.
views/: Contains the Handlebars templates for the application.

Key Files
auth/auth.js: Handles user authentication.
controllers/adminController.js: Handles admin routes.
controllers/donateController.js: Handles donation routes.
controllers/homeController.js: Handles home routes.
controllers/staffController.js: Handles staff routes.
data/dbManager.js: Manages the database.
models/donationModel.js: Defines the donation data model.
models/userModel.js: Defines the user data model.
routes/adminRoutes.js: Defines the admin routes.
routes/donateRoutes.js: Defines the donation routes.
routes/homeRoutes.js: Defines the home routes.
routes/staffRoutes.js: Defines the staff routes.

Miscellaneous Information
The database has pantries seeded, a few contact messages, as well as a few donators, one admin and two staff.
Donations are not seeded. You must create a donation to perform staff features.

Running the Application
To run the application, first install the following dependencies with npm install >>>

dependencies: 
    "bcrypt": "^5.1.1",
    "bootstrap": "^5.3.3",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-handlebars": "^7.1.2",
    "express-session": "^1.18.0",
    "gray-nedb": "^1.8.3",
    "jsonwebtoken": "^9.0.2",
    "path": "^0.12.7"

 Then, start the application with node index.js.

