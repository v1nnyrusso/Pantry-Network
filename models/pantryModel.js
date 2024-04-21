const dbManager = require('../data/dbManager');

class Pantry {

    // Constructor for db
    constructor(dbManager) {
        if (dbManager) {
            this.dbManager = dbManager;
            console.log('Db connected to pantry model');
        }
        else {
            throw new Error('No db manager provided');
        }
    }

    // Initialise pantries
async pantryInitialiser() {
    return new Promise((resolve, reject) => {
        const pantries = [

            // Static id so staff can be seeded assigned to pantry
            { _id: 'IGtRVJCHNHEAsAeK', dataStore: 'Pantry', pantryName: 'Parkhead School House', location: 'Glasgow', address: '135 Westmuir St, Parkhead', postcode: 'G31 5EX', staffMembers: ['userId4'], donations: ['donationId1'] },
            { _id: 'yRfjPiGLs84oGDbe', dataStore: 'Pantry', pantryName: 'Govanhill Pantry', location: 'Glasgow', address: '488 Cathcart Rd', postcode: 'G42 7BX', staffMembers: ['userId3'], donations: [] },
            { _id: 'Ut22rpI3PD3Soxh8', dataStore: 'Pantry', pantryName: 'Croftpark Pantry', location: 'Glasgow', address: 'Croftpark Ave, Crofthill Rd', postcode: 'G 44 5NR', staffMembers: ['userId3', 'userId4'], donations: ['donationId2'] }
        ];

        // Make sure pantry is unique
        pantries.forEach(pantry => {
            this.dbManager.db.findOne({ pantryName: pantry.pantryName }, (err, obj) => {
                if (err) {
                    console.error("Error finding pantry:", err);
                    reject(err);
                    return;
                }
                // If exists, error
                if (obj) {
                    console.error("Pantry already exists:", pantry.pantryName);
                    reject(new Error(`Pantry already exists: ${pantry.pantryName}`));
                    return;
                }

                // Insert pantry without _id field
                this.dbManager.db.insert(pantry, (err, obj) => {
                    if (err) {
                        console.error("Error inserting pantry:", err);
                        reject(err);
                        return;
                    }
                    console.log("Pantry inserted successfully:", pantry.pantryName);
                });
            });

        });

        resolve();
    })
}

    // Function to get all pantries, sorted by name
    async getAllPantries() {
        // Get all pantries
        return new Promise((resolve, reject) => {
            this.dbManager.db.find({pantryName: {$exists: true}}).sort({pantryName: 1}).exec((err, pantries) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(pantries);
                    console.log('function all() returns: ', pantries);
                }
            });

        })

    }

    // Get all pantries without sorting
    async getPantries() {
        return new Promise((resolve, reject) => {
            this.dbManager.db.find({ dataStore: 'Pantry' }, (err, pantries) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(pantries);
                    console.log('function all() returns: ', pantries);
                }
            });
        });
    }
    
    // insert staff member to pantry
    async insertStaff (staffId, pantryId) {
        return new Promise((resolve, reject) => {
            this.dbManager.db.update({ _id: pantryId }, { $push: { staffMembers: staffId } }, {}, (err, numReplaced) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(numReplaced);
                }
            });
        });
    }



    // Function to get pantry by id
    async getPantryById(pantryId) {
        return new Promise((resolve, reject) => {
            this.dbManager.db.findOne({ _id: pantryId }, (err, pantry) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(pantry);
                }
            });
        });
    }

    // Add the donation to the pantry by id
    async addDonationToPantry(pantryId, donationId) {
        return new Promise((resolve, reject) => {
            this.dbManager.db.update({ _id: pantryId }, { $push: { donations: donationId } }, {}, (err, numReplaced) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(numReplaced);
                }
            });
        });
    }
}

// Make new db and initialise, export
pantries = new Pantry(dbManager);
pantries.pantryInitialiser();
module.exports = pantries;