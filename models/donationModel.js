const dbManager = require('../data/dbManager');



// New class to handle donations
class DonationDao {

    constructor(dbManager) {

        if (dbManager) {
            this.dbManager = dbManager;
            console.log('Db connected to donation model');
        }
        else {
            throw new Error('No db manager provided');
        }
    }

    // Initialiser method for what items are needed
    async itemsNeededInitializer() {
        return new Promise((resolve, reject) => {


            // Create a new list of items needed by pantries
            const itemsNeeded = [
                { neededItem: 'carrots', typeOfItem: 'vegetable', 'currentStock': 0 },
                { neededItem: 'apples', typeOfItem: 'fruit', 'currentStock': 0 },
                { neededItem: 'milk', typeOfItem: 'dairy', 'currentStock': 0 },
                { neededItem: 'bread', typeOfItem: 'grain', 'currentStock': 0 },
                { neededItem: 'chicken', typeOfItem: 'meat', 'currentStock': 0 },
                { neededItem: 'eggs', typeOfItem: 'dairy', 'currentStock': 0 },
                { neededItem: 'butter', typeOfItem: 'dairy', 'currentStock': 0 },
                { neededItem: 'mince', typeOfItem: 'meat', 'currentStock': 0 },

            ]

            // Find each item in the database
            itemsNeeded.forEach(item => {
                this.dbManager.db.findOne({ neededItem: item.neededItem }, (err, doc) => {
                    if (err) {
                        console.error("Error finding item:", err);
                        reject(err);
                        return;
                    }

                    // If item exists, reject the promise
                    if (doc) {
                        console.error("Item already exists:", item.neededItem);
                        reject(new Error(`Item already exists: ${item.neededItem}`));
                        return;
                    }

                    // Seed some items needed
                    this.dbManager.db.insert(item, (err, docs) => {
                        if (err) {
                            console.error("Error inserting items needed:", err);
                            reject(err);
                            return;
                        }

                    });

                    // Else everything went well
                    console.log('Item:', item.neededItem,'inserted successfully.');


                });
            });

            // Resolve the promise
            resolve();
        });
    }

    // Initialiser method
    async donationInitializer() {

        const expirydate = new Date();

        // Makes the food expire in 7 days
        expirydate.setDate(expirydate.getDate() + 7);

        return new Promise((resolve, reject) => {
            const donations =
                [
                    { _id: 'donationId1', userId: 'userId1', type: 'vegetable', name: 'carrot', quantity: 2, useByDate: expirydate, status: 'pending' },
                    { _id: 'donationId2', userId: 'userId2', type: 'fruit', name: 'apple', quantity: 3, useByDate: expirydate, status: 'pending' }
                ]


            donations.forEach(donation => {

                this.dbManager.db.findOne({ _id: donation._id }, (err, doc) => {
                    if (err) {
                        console.error("Error finding donation:", err);
                        reject(err);
                        return;
                    }

                    // If donation exists, reject the promise
                    if (doc) {
                        console.error("Donation already exists:", donation._id);
                        reject(new Error(`Donation already exists: ${donation._id}`));
                        return;
                    }

                    // Seed some donations
                    this.dbManager.db.insert(donation, (err, docs) => {
                        if (err) {
                            console.error("Error inserting donations:", err);
                            reject(err);
                            return;
                        }

                        // Went to plan
                        console.log("Donations inserted successfully.");


                    });

                });
            });
            resolve();
        });
    }

    // Get all items needed
    async getItemsNeeded()
    {
   
        // Make new promise
        return new Promise((resolve, reject) => {
            this.dbManager.db.find({neededItem: {$exists:true}}, (err, items) => {
                if(err){
                    console.error('Error finding items needed:', err);
                    reject(err);
                    return;
                }
                
                resolve(items);
                console.log('Items needed returned from getItemsNeeded():', items);

            });
        });
    }
    
            
}

const donation = new DonationDao(dbManager);
donation.donationInitializer();
donation.itemsNeededInitializer();
module.exports = donation;