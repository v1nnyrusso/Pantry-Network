// Import nedb module
const dbManager = require('../data/dbManager');

// Import the 'bcrypt' module
const bcrypt = require('bcrypt');

// Define the number of salt rounds for bcrypt hashing
const saltRounds = 10;

class UserDao {

    // Constructor for the User DAO (data access object)
    constructor(dbManager) {
    
        // Check if a dbManager is provided
        if (dbManager) {

            // Set the dbManager
            this.dbManager = dbManager;
            console.log('Db connected to user model');

        }

        // If no dbManager is provided, throw an error
        else {

            throw new Error('No db manager provided');

        }
    }

    // Initialise users / seed some users
    async userInitialiser() {
        return new Promise((resolve, reject) => {
            const users = [
                {  dataStore: 'User', firstName: 'Vincenzo', secondName: 'Russo', organisation: 'Tesco', number: '123456789', email: 'vincenzo@example.com', password: bcrypt.hashSync('123', saltRounds), role: 'donator', donations: [] },
                {  dataStore:'User',firstName: 'Conor', secondName: 'Lynagh', organisation: 'Iceland', number: '987654321', email: 'conor@example.com', password: bcrypt.hashSync('123', saltRounds), role: 'donator', donations: [] },
                {  dataStore: 'User',firstName: 'Admin', secondName: 'Admin', organiation: null, number: '123456789', email: 'admin@admin.com', password:bcrypt.hashSync('admin', saltRounds), role: 'admin', donations: [] },
                {  dataStore:'User', firstName: 'Staff', secondName: 'Staff', organisation: null, number: '123456789', email: 'staff@staff.com', password: bcrypt.hashSync('staff', saltRounds), role: 'staff', donations: [], pantryId: 'IGtRVJCHNHEAsAeK' },
                {  dataStore:'User', firstName: 'Staff', secondName: 'Staff', organisation: null, number: '123456789', email: 'staff2@staff.com', password: bcrypt.hashSync('staff', saltRounds), role: 'staff', donations: [], pantryId: 'Ut22rpI3PD3Soxh8' }
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
     create(firstName, secondName, organisation, number, email, password, pantry, source) {
        const that = this;

        // Hash the password using bcrypt
        bcrypt.hash(password, saltRounds, function (err, hash) {

            var entry = { dataStore: 'User', firstName: firstName, secondName: secondName, number: number, email: email, role: '', password: hash, claims: [], donations: [], pantryId: pantry, organisation: organisation};
            if (err) {
                console.error("Error hashing password:", err);
                return;
            }

            console.log('source',source)

            // Depending on the source, set the role of the user for modularity and reusability
            switch (source) {
                case 'admin':
                    entry.role = 'admin';
                    entry.pantryId = null;
                    entry.claims = null;
                    break;
                case 'registration':
                    entry.role = 'donator';
                    entry.claims = [];
                    entry.pantryId = [];
                    break;
                case 'staff':
                    entry.role = 'staff';
                    entry.organisation = [];
                    entry.donations = [];
                    entry.pantryId = pantry;
       
            }

            // Insert the user entry into the database
            that.dbManager.db.insert(entry, function (err) {
                if (err) {
                    console.error("Error inserting user:", err);
                    return;
                }
                console.log("User", entry, "successfully inserted into the database.");
            });
        });
    }

    // Delete the user by ID
    deleteUser(id) {

        return new Promise((resolve, reject) => {

            this.dbManager.db.remove({ _id: id }, {}, (err) => {
                if (err) {
                    console.error("Error deleting user:", err);
                    reject(err);
                    return;
                }
                console.log("User deleted successfully.");
                resolve();
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

    // Lookup user based on role type
    async getUsers(type) {

        return new Promise((resolve, reject) => {

            // Use switch for modularity and to avoid repetition
            switch (type) {
                case 'donator':
                    this.dbManager.db.find({ role: type }, (err, entries) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(entries);
                    });
                    break;
                case 'staff':
                    this.dbManager.db.find({ role: type }, (err, entries) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(entries);
                    });
                    break;
                case 'admin':
                    this.dbManager.db.find({ role: type }, (err, entries) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(entries);
                    });
                    break;
                default:
                    // Reject promise if invalid user type
                    reject(new Error('Invalid user type'));
            }

        })
        
    }

    // Get user based on id, add donation to user
    async addUserDonation(donationId, userId) {

        console.log('Adding donation to user:', donationId, userId);
        return new Promise((resolve, reject) => {
            if (!donationId || !userId) {
                console.error(" ID not found");
                reject(new Error("ID not found"));
                return;
            }
    
            // Construct the query to find the user by userId
            const query = { _id: userId };
    
            // Update the user document to push the donationId to the donations array
            this.dbManager.db.update(query, { $push: { donations: donationId } }, {}, (err) => {
                if (err) {
                    console.error("Error adding donation to user:", err);
                    reject(err);
                    return;
                }
    
                console.log("Added donation to user");
                resolve();
            });
        });
    }

    // Get user based on id, add claim to user,
    async getUserById(id) {

        return new Promise((resolve, reject) => {

            this.dbManager.db.findOne({ _id: id }, (err, entry) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(entry);
            });


        })

    }

}

//  Create new instance of class that Initialises database and export class to use outside of model
const user = new UserDao(dbManager);
user.userInitialiser();
module.exports = user;



