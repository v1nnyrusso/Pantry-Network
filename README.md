README


Project Overview 

This project is a web application for managing a food pantry, using an MVC architectural pattern. It includes features for handling donations, managing products, and user registration. The application is built using Node.js and Express, with data stored in a local nedb-gray database.


Features

- There are three roles, donator, admin and staff.

- Donator: Can create pending donations to staff by adding products to a cart and checking out

- Staff: Can claim or reject pending donations, checking out in a similar basket but with claimed items. They can also mark items as claimed once the items have reached the pantry.

- Admin: Admins can CRUD (create, read, update and delete) staff and products. They can also delete messages sent via contact form.

- Unauthorised user: Can login, register and send in a contact form message, as well as peruse the website. All of the above can do this.


Directory Structure (MVC)

- auth/: Contains the authentication logic.

- controllers/: Contains the controllers for handling different routes, an intermediary between the views and models.

- css/: Contains the CSS files for styling the application.

- data/: Contains the database manager.

- models/: Contains the data models for the application. The database uses these models to update the database.

- public/: Contains public assets like images and stylesheets.

- routes/: Contains the route definitions for the application.

- scripts/: Contains JavaScript scripts for the application.

- views/: Contains the Handlebars templates for the application.


Key Files

- auth/auth.js: Handles user authentication.
- data/dbManager.js: Manages the database.

Miscellaneous Information

The database has pantries seeded, a few contact messages, as well as a few donators, one admin and two staff.
Donations are not seeded. You must create a donation to perform staff features.


Runnning the Application

To run the application, follow these steps:

- Clone the repository: git clone https://github.com/vrusso300/CWK2.git
- Navigate to the project directory.
- Install the following dependencies: npm install


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
    
- Start the application: node index.js

Thank you for reading.
