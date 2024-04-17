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
    async pantryInitializer() {
        return new Promise((resolve, reject) => {
            const pantries = [
                { _id: 'pantryId1', name: 'Parkhead School House', location: 'Glasgow', address: '135 Westmuir St, Parkhead', postcode: 'G31 5EX', staffMembers: ['userId4'], donations :['donationId1'] },
                { _id: 'pantryId2', name: 'Govanhill Pantry', location: 'Glasgow', address: '488 Cathcart Rd', postcode: 'G42 7BX', staffMembers: ['userId3'], donations :[] },
                { _id: 'pantryId3', name: 'Croftpark Pantry', location: 'Glasgow', address: 'Croftpark Ave, Crofthill Rd', postcode: 'G 44 5NR', staffMembers: ['userId3', 'userId4'], donations :['donationId2'] }

            ];

            // make sure pantry is unique
            pantries.forEach(pantry => {
                this.dbManager.db.findOne({ name: pantry.name }, (err, doc) => {
                    if (err) {
                        console.error("Error finding pantry:", err);
                        reject(err);
                        return;
                    }

                    // If exiests, error
                    if (doc) {
                        console.error("Pantry already exists:", pantry.name);
                        reject(new Error(`Pantry already exists: ${pantry.name}`));
                        return;
                    }

                    // Insert pantry
                    this.dbManager.db.insert(pantry, (err, doc) => {
                        if (err) {
                            console.error("Error inserting pantry:", err);
                            reject(err);
                            return;
                        }
                        console.log("Pantry inserted successfully:", pantry.name);
                    });
                });
                    
            });

            resolve();
        })
    }


    // Function to get all pantries
    async getAllPantries() {
        // Get all pantries
        return new Promise((resolve, reject) => {
            this.dbManager.db.find({name: {$exists: true}}, (err, pantries) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(pantries);
                    console.log('function all() returns: ', pantries);
                }
            })

        })

    }
}

// Make new db and initialise, export
pantries = new Pantry(dbManager);
pantries.pantryInitializer();
module.exports = pantries;