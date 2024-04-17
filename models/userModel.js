// Import nedb and bcrypt modules
// Import the 'gray-nedb' module as 'Datastore'
const dbManager = require('../data/dbManager');

// Import the 'bcrypt' module
const bcrypt = require('bcrypt');

// Define the number of salt rounds for bcrypt hashing
const saltRounds = 10;

class UserDao {

    constructor(dbManager) {
        // If dbFilePath is true
        // Create a new instance of Datastore with the provided file path
        if (dbManager) {

            this.dbManager = dbManager;
            console.log('Db connected to user model');

        }
        else {

            throw new Error('No db manager provided');

        }
    }

    // Initialise users / seed some users
    async userInitializer() {
        return new Promise((resolve, reject) => {
            const users = [
                { _id: 'userId1', firstName: 'Vincenzo', secondName: 'Russo', organisation: 'Tesco', number: '123456789', email: 'vincenzo@example.com', password: bcrypt.hashSync('123', saltRounds), role: 'donator', donations: [] },
                { _id: 'userId2', firstName: 'Conor', secondName: 'Lynagh', organisation: 'Iceland', number: '987654321', email: 'conor@example.com', password: bcrypt.hashSync('123', saltRounds), role: 'donator', donations: [] },
                { _id: 'userId3', firstName: 'Admin', secondName: 'Admin', organiation: null, number: '123456789', email: 'admin@admin.com', password:bcrypt.hashSync('admin', saltRounds), role: 'admin', donations: [] },
                { _id: 'userId4', firstName: 'Staff', secondName: 'Staff', organisation: null, number: '123456789', email: 'staff@staff.com', password: bcrypt.hashSync('staff', saltRounds), role: 'staff', donations: [] }
            ];
    
            // Find each user in the database
            users.forEach(user => {
                this.dbManager.db.findOne({ email: user.email }, (err, doc) => {
                    if (err) {
                        console.error("Error finding user:", err);
                        reject(err);
                        return;
                    }
    
                    // If user exists, reject the promise
                    if (doc) {
                        console.error("User already exists:", user.email);
                        reject(new Error(`User already exists: ${user.email}`));
                        return;
                    }
    
                    // If error, reject 
                    this.dbManager.db.insert(user, (err, doc) => {
                        if (err) {
                            console.error("Error inserting user:", err);
                            reject(err);
                            return;
                        }
                        console.log("User inserted successfully:", user.email);
                    });
                });
            });
    
            // Resolve the promise, got this far
            resolve();
        });
    }

    // Create a new user
     create(firstName, secondName, organisation, number, email, password, source) {
        const that = this;

        // Hash the password using bcrypt
        bcrypt.hash(password, saltRounds, function (err, hash) {

            var entry = { firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1), secondName: secondName.charAt(0).toUpperCase() + secondName.slice(1), number: number, email: email, password: hash, donations: []};
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
                    entry.organisation = organisation.charAt(0).toUpperCase() + organisation.slice(1);
            }

            // Insert the user entry into the database
            that.dbManager.db.insert(entry, function (err) {
                if (err) {
                    console.error("Error inserting user:", err);
                    return;
                }
                console.log("User", email, "successfully inserted into the database.");
            });
        });
    }


    // Lookup user based on email
    lookupEmail(user, cb) {

        this.dbManager.db.find({ 'email': user },

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
const user = new UserDao(dbManager);
user.userInitializer();
module.exports = user;



