// Import dbManager
const e = require('express');
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

    // Initialiser method
    async donationInitialiser() {

        let expirydate = new Date();
        expirydate.setDate(expirydate.getDate() + 7);





        // No donations added as of now
        return new Promise((resolve, reject) => {
            const donations =
                [
                    // { dataStore: 'donation', pantryId: '1kz8jFYAKQEgnZub', products: [{ donationLineId: '1', productName: 'Canned Soup', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '2', productName: 'Canned Beans', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '3', productName: 'Canned Vegetables', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '4', productName: 'Canned Fruit', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '5', productName: 'Canned Meat', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '6', productName: 'Canned Fish', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '7', productName: 'Canned Pasta', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '8', productName: 'Canned Soup', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '9', productName: 'Canned Soup', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '10', productName: 'Canned Soup', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '11', productName: 'Canned Soup', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '12', productName: 'Canned Soup', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '13', productName: 'Canned Soup', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '14', productName: 'Canned Soup', quantity: 100, expiryDate: expirydate, isClaimed: false }, { donationLineId: '15', productName: 'Canned Soup', quantity: 100, expiryDate: expirydate, isClaimed: false }]}, 

                ]

            // Find each donation in the database
            donations.forEach(donation => {

                // Find each donation in the database
                this.dbManager.db.findOne({ _id: donation._id }, (err, obj) => {
                    if (err) {
                        console.error("Error finding donation:", err);
                        reject(err);
                        return;
                    }

                    // If donation exists, reject the promise
                    if (obj) {
                        console.error("Donation already exists:", donation._id);
                        reject(new Error(`Donation already exists: ${donation._id}`));
                        return;
                    }

                    // Seed some donations
                    this.dbManager.db.insert(donation, (err, objs) => {
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
            // Resolve the promise
            resolve();
        });
    }

    // Get all donations
    async getDonations() {

        return new Promise((resolve, reject) => {
            this.dbManager.db.find({ dataStore: 'Donation' }, (err, docs) => {
                if (err) {
                    console.error("Error getting donations:", err);
                    reject(err);
                    return;
                }

                resolve(docs);
            });
        });

    }


    // Get donation by id
    async getDonationById(id) {

        return new Promise((resolve, reject) => {
            this.dbManager.db.find({ pantryId: id }, (err, doc) => {

                if (err) {
                    console.error("Error getting donation:", err);
                    reject(err);
                    return;
                }

                // Resolve the promise, send the doc
                resolve(doc);
            });

        });

    }

    async getDonations() {
        return new Promise((resolve, reject) => {
            this.dbManager.db.find({ dataStore: 'Donation' }, (err, docs) => {
                if (err) {
                    console.error("Error getting donations:", err);
                    reject(err);
                    return;
                }

                resolve(docs);
            });
        });
    }

    // Update the donation line in the database, pass in doantionId, donationLineId and the product
    updateDonationLine(donationId, donationLineId, product) {
        return new Promise((resolve, reject) => {
            // Find the donation by its ID
            this.dbManager.db.findOne({ _id: donationId }, (err, obj) => {
                if (err) {
                    console.error("Error finding donation:", err);
                    reject(err);
                    return;
                }

                // Check if the object is found
                if (obj) {
                    // Initialise the products array if not exists
                    obj.products = obj.products || [];

                    // Loop through products to find the specific one
                    for (let donationLine of obj.products) {
                        if (donationLine.donationLineId == donationLineId) {
                            // Update the quantity and set isClaimed to true 
                            donationLine.quantity = product.quantity;
                            donationLine.isClaimed = product.isClaimed;
                            donationLine.expiry = product.expiry;
                            donationLine.productName = product.productName;
                            donationLine.donationLineId = product.donationLineId;
                            donationLine.status = product.status;
                            break;
                        }
                    }

                    console.log(obj.products);

                    // Update the donation in the database
                    this.dbManager.db.update({ _id: donationId }, { $set: { products: obj.products } }, {}, (err) => {
                        if (err) {
                            console.error("Error updating donation:", err);
                            reject(err);
                            return;
                        }

                        // Log the success, went to plan, finally!
                        console.log("Donation updated successfully:", donationId, donationLineId, product);
                        
                        resolve(); 
                    });
                } else {
                    // Reject if donation is not found
                    reject(new Error('Donation not found'));
                }
            });
        });
    }

    async updateDonationLineStatus(donationId, donationLineId, status) {

        return new Promise((resolve, reject) => {
            this.dbManager.db.findOne({ _id: donationId }, (err, obj) => {
                if (err) {
                    console.error("Error finding donation:", err);
                    reject(err);
                    return;
                }

                if (obj) {
                    obj.products = obj.products || [];

                    for (let donationLine of obj.products) {
                        if (donationLine.donationLineId == donationLineId) {
                            donationLine.status = status;
                            break;
                        }
                    }

                    this.dbManager.db.update({ _id: donationId }, { $set: { products: obj.products } }, {}, (err) => {
                        if (err) {
                            console.error("Error updating donation:", err);
                            reject(err);
                            return;
                        }

                        console.log("Donation updated successfully:", donationId, donationLineId, status);
                        resolve();
                    });
                } else {
                    reject(new Error('Donation not found'));
                }
            });
        });

    }




    // Insert donation method into database
    async makeDonation(donation) {
        return new Promise((resolve, reject) => {

            // Insert donation
            this.dbManager.db.insert(donation, (err, obj) => {
                if (err) {
                    console.error("Error inserting donation:", err);
                    reject(err);
                    return;
                }

                console.log("Donation inserted successfully:", donation);
                resolve(obj._id);
            });
        });
    }

    

}

// Make new donation object, pass it to dbManager constructor
const donation = new DonationDao(dbManager);
donation.donationInitialiser();
module.exports = donation;