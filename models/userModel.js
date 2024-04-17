// Import nedb and bcrypt modules
// Import the 'gray-nedb' module as 'Datastore'
const Datastore = require("gray-nedb");

// Import the 'bcrypt' module
const bcrypt = require('bcrypt');

// Define the number of salt rounds for bcrypt hashing
const saltRounds = 10;

class UserDao {

    constructor(dbFilePath) {
        // If dbFilePath is true
        // Create a new instance of Datastore with the provided file path
        if (dbFilePath) {

            this.db = new Datastore({
                filename: dbFilePath,
                autoload: true,


            });

        }
        // If dbFilePath is false 
        // make a new in-memory database
        else {
            // Create a new instance of Datastore without a file path (in-memory database)
            this.db = new Datastore();
  
        }
    }

    // Initialiser method
    init() {
        this.db.insert({
            firstName: 'Vincenzo',
            secondName: 'Russo',
            organisation: 'Tesco',
            number: '123456789',
            email: 'vincenzo@example.com',
            password: bcrypt.hashSync('123', saltRounds),
            role: 'donator'
        });
        this.db.insert({
            firstName: 'Conor',
            secondName: 'Lynagh',
            organisation: 'Iceland',
            number: '987654321',
            email: 'conor@example.com',
            password: bcrypt.hashSync('123', saltRounds),
            role: 'donator'
        });
        this.db.insert({
            firstName: 'Administrator',
            secondName: 'Smith',
            number: '123456789',
            email: 'admin@admin.com',
            password: bcrypt.hashSync('admin', saltRounds),
            role: 'admin'
        });
        return this;
    }


    create(firstName, secondName, organisation, number, email, password, source) {
        const that = this;

        // Hash the password using bcrypt
        bcrypt.hash(password, saltRounds, function (err, hash) {

            var entry = { firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1), secondName: secondName.charAt(0).toUpperCase() +secondName.slice(1), number: number, email: email, password: hash };
            if (err) {
                console.error("Error hashing password:", err);
                return;
            }

            // Depending on the source, set the role of the user
            switch (source) {
                case 'admin':
                    entry.role = 'admin';
                    break;
                case 'registration':
                    entry.role = 'donator';
                    entry.organisation = organisation.charAt(0).toUpperCase() + organisation.slice(1);
                    break;
                case 'staff':
                    entry.role = 'staff';    
            }

            // Insert the user entry into the database
            that.db.insert(entry, function (err) {
                if (err) {
                    console.error("Error inserting user:", err);
                    return;
                }
                console.log("User", email, "successfully inserted into the database.");
            });
        });
    }


    lookup(user, cb) {

        this.db.find({ 'email': user },

            (err, entries) => {
                if (err) {
                    return cb(null, null);
                }
                else {
                    if (entries.length == 0) {
                        return cb(null, null);
                    }
                    return cb(null, entries[0]);
                }

            });
        
    }

}



//  Create new instance of class that Initialises database and export class to use outside of model
const dao = new UserDao("./database/users.db");
dao.init();
module.exports = dao;



