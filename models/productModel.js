// Get the dbManager
const dbManager = require('../data/dbManager');

// New class to handle products
class ProductDao {

    constructor(dbManager) {

        if (dbManager) {
            this.dbManager = dbManager;
            console.log('Db connected to product model');
        }
        else {
            throw new Error('No db manager provided');
        }
    }

    // Initializer method for what items are needed
    async itemsNeededInitialiser() {
        return new Promise((resolve, reject) => {
 
            // Seed some products 
            const products = [
                { dataStore: 'Product', productName: 'Carrot', typeOfProduct: 'Food', currentStock: 0, categories: ['Vegetable', 'Fresh Produce'] },
                { dataStore: 'Product', productName: 'Potato', typeOfProduct: 'Food', currentStock: 0, categories: ['Vegetable', 'Fresh Produce'] },
                { dataStore: 'Product', productName: 'Onion', typeOfProduct: 'Food', currentStock: 0, categories: ['Vegetable', 'Fresh Produce'] },
                { dataStore: 'Product', productName: 'Banana', typeOfProduct: 'Food', currentStock: 0, categories: ['Fruit', 'Fresh Produce'] },
                { dataStore: 'Product', productName: 'Apple', typeOfProduct: 'Food', currentStock: 0, categories: ['Fruit', 'Fresh Produce']},
                { dataStore: 'Product', productName: 'Orange', typeOfProduct: 'Food', currentStock: 0, categories: ['Fruit', 'Fresh Produce'] },
                { dataStore: 'Product', productName: 'Milk', typeOfProduct: 'Food', currentStock: 0, categories: ['Dairy', 'Drink'] },
                { dataStore: 'Product', productName: 'Cheese', typeOfProduct: 'Food', currentStock: 0, categories: ['Dairy'] },
                { dataStore: 'Product', productName: 'Yogurt', typeOfProduct: 'Food', currentStock: 0, categories: ['Dairy'] },
                { dataStore: 'Product', productName: 'Crisps', typeOfProduct: 'Food', currentStock: 0, categories: ['Snack'] },
                { dataStore: 'Product', productName: 'Chocolate', typeOfProduct: 'Food', currentStock: 0, categories: ['Snack'] },
                { dataStore: 'Product', productName: 'Biscuits', typeOfProduct: 'Food', currentStock: 0, categories: ['Snack', 'Grain'] },
                { dataStore: 'Product', productName: 'Coca Cola', typeOfProduct: 'Food', currentStock: 0, categories: ['Drink'] },
                { dataStore: 'Product', productName: 'Bottled Water', typeOfProduct: 'Food', currentStock: 0, categories: ['Drink'] },
                { dataStore: 'Product', productName: 'Chicken Breast', typeOfProduct: 'Food', currentStock: 0, categories: ['Meat', 'Chicken'] },
                { dataStore: 'Product', productName: 'Chicken Thighs', typeOfProduct: 'Food', currentStock: 0, categories: ['Meat', 'Chicken'] },
                { dataStore: 'Product', productName: 'Eggs', typeOfProduct: 'Food', currentStock: 0, categories: ['Dairy'] },
                { dataStore: 'Product', productName: 'Beef Mince', typeOfProduct: 'Food', currentStock: 0, categories: ['Meat', 'Beef'] },
                { dataStore: 'Product', productName: 'Pork Mince', typeOfProduct: 'Food', currentStock: 0, categories: ['Meat', 'Pork'] },
                { dataStore: 'Product', productName: 'Bacon', typeOfProduct: 'Food', currentStock: 0, categories: ['Meat', 'Pork'] },
                { dataStore: 'Product', productName: 'Pasta', typeOfProduct: 'Food', currentStock: 0, categories: ['Grain'] },
                { dataStore: 'Product', productName: 'Canned Tomatoes', typeOfProduct: 'Food', currentStock: 0, categories: ['Canned', 'Vegetable'] },
                { dataStore: 'Product', productName: 'Canned Soup', typeOfProduct: 'Food', currentStock: 0, categories: ['Canned'] },
                { dataStore: 'Product', productName: 'Nappies', typeOfProduct: 'Non-food', currentStock: 0, categories: ['Toiletries', 'Baby'] },
                { dataStore: 'Product', productName: 'Baby Milk', typeOfProduct: 'Food', currentStock: 0, categories: ['Baby'] },
                { dataStore: 'Product', productName: 'Toothpaste', typeOfProduct: 'Non-food', currentStock: 0, categories: ['Toiletries'] },
                { dataStore: 'Product', productName: 'Shampoo', typeOfProduct: 'Non-food', currentStock: 0, categories: ['Toiletries'] },
                { dataStore: 'Product', productName: 'Soap', typeOfProduct: 'Non-food', currentStock: 0, categories: ['Toiletries'] },
                { dataStore: 'Product', productName: 'Toilet Paper', typeOfProduct: 'Non-food', currentStock: 0, categories: ['Toiletries'] },
                { dataStore: 'Product', productName: 'Sanitary Towels', typeOfProduct: 'Non-food', currentStock: 0, categories: ['Toiletries'] },
                { dataStore: 'Product', productName: 'Dog Food', typeOfProduct: 'Food', currentStock: 0, categories: ['Pet'] },
                { dataStore: 'Product', productName: 'Cat Food', typeOfProduct: 'Food', currentStock: 0, categories: ['Pet'] },
            ];


            // Find each item in the database
            products.forEach(item => {
                this.dbManager.db.findOne({ productName: item.productName }, (err, obj) => {
                    if (err) {
                        console.error("Error finding product:", err);
                        reject(err);
                        return;
                    }

                    // If item exists, reject the promise
                    if (obj) {
                        console.error("Product already exists:", item.productName);
                        reject(new Error(`Product already exists: ${item.productName}`));
                        return;
                    }

                    // Seed some items needed
                    this.dbManager.db.insert(item, (err, objs) => {
                        if (err) {
                            console.error("Error inserting items needed:", err);
                            reject(err);
                            return;
                        }

                    });

                    // Else everything went well
                    console.log('Item:', item.productName, 'inserted successfully.');


                });
            });

            // Resolve the promise
            resolve();
        });
    }

    addDonationIdToProduct(productId, donationId) {
        return new Promise((resolve, reject) => {
            this.dbManager.db.update({ _id: productId }, { $push: { donations: donationId } }, {}, (err) => {
                if (err) {
                    console.error("Error adding donation id to product:", err);
                    reject(err);
                    return;
                }
                console.log("Donation id added to product successfully");
                resolve();
            });
        });
    }


    // Get all items needed
    async getProducts() {
        // Make new promise
        return new Promise((resolve, reject) => {
            this.dbManager.db.find({ productName: { $exists: true } }).sort({ productName: 1 }).exec((err, items) => {
                if (err) {
                    console.error('Error finding items needed:', err);
                    reject(err);
                    return;
                }

                resolve(items);

            });
        });
    }

    // Update productDAO.getProducts() to accept a category parameter
    async getProductsByCategory(category) {
        return new Promise((resolve, reject) => {
            this.dbManager.db.find({ categories: category }, (err, products) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(products);
            });
        });
    }

    // Get products by id
    async getProductById(id) {
        return new Promise((resolve, reject) => {
            this.dbManager.db.findOne({ _id: id }, (err, product) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(product);
            });
        });
    }

    // Update stock method
    async updateStock(item, qty) {
        return new Promise((resolve, reject) => {
            // Find the item
            this.dbManager.db.findOne({ _id: item }, (err, obj) => {
                if (err) {
                    console.error("Error finding item:", err);
                    reject(err);
                    return;
                }

                if (!obj) {
                    console.error("Item not found:", item);
                    reject(new Error("Item not found"));
                    return;
                }

                // Update the stock, make sure to parse it as an integer
                const updatedStock = obj.currentStock + parseInt(qty);

                // Update the item in the database
                // Parse the updated stock as an integer
                this.dbManager.db.update({ _id: item }, { $set: { currentStock: updatedStock } }, {}, (err) => {
                    if (err) {
                        console.error("Error updating stock:", err);
                        reject(err);
                        return;
                    }

                    console.log("Stock updated successfully for", item, "new stock:", updatedStock);
                    resolve(updatedStock);
                });
            });
        });
    }

    // Update stock method
    async updateStockMinus(item, qty) {
        return new Promise((resolve, reject) => {
            // Find the item
            this.dbManager.db.findOne({ _id: item }, (err, obj) => {
                if (err) {
                    console.error("Error finding item:", err);
                    reject(err);
                    return;
                }

                if (!obj) {
                    console.error("Item not found:", item);
                    reject(new Error("Item not found"));
                    return;
                }

                // Update the stock, make sure to parse it as an integer
                const updatedStock = obj.currentStock - parseInt(qty);

                // Update the item in the database
                // Parse the updated stock as an integer
                this.dbManager.db.update({ _id: item }, { $set: { currentStock: updatedStock } }, {}, (err) => {
                    if (err) {
                        console.error("Error updating stock:", err);
                        reject(err);
                        return;
                    }

                    console.log("Stock updated successfully for", item, "new stock:", updatedStock);
                    resolve(updatedStock);
                });
            });
        });
    }

    // Delete product method
    async deleteProduct(id)
    {
        return new Promise((resolve, reject) => {
            this.dbManager.db.remove({ _id: id }, {}, (err) => {
                if (err) {
                    console.error("Error deleting product:", err);
                    reject(err);
                    return;
                }
                console.log("Product deleted successfully");
                resolve();
            });
        });
    }

    async lookupProduct(name) {
        console.log('Trying to look up product:', name);
        return new Promise((resolve, reject) => {
            console.log('Attempting to find product in the database.');
            this.dbManager.db.findOne({ productName: name }, (err, obj) => {
                
                if (err) {
                    console.log('Error occurred while looking up product:', err);
                    reject(err);
                    return;
                }
    
                if (obj) {
                    console.log('Product found in the database:', obj);
                    resolve(obj);
                } else {
                    console.log('Product not found in the database.');
                    resolve(); 
                }
            });
        });
    }
    

    async create(productName, typeOfProduct, currentStock, categories, expiry) {
        return new Promise((resolve, reject) => {
            // Create a new product
            const newProduct = {
                productName: productName,
                typeOfProduct: typeOfProduct,
                // Parse the current stock as an integer
                // Ended up not using this, but it's here for future reference
                currentStock: parseInt(currentStock),
                categories: categories,
                expiry: expiry
            };

            // Insert the new product
            this.dbManager.db.insert(newProduct, (err, obj) => {
                if (err) {
                    console.error("Error inserting product:", err);
                    reject(err);
                    return;
                }
                console.log("Product inserted successfully", newProduct);
                resolve(obj);
            });
        });
    
    }

}

const productDao = new ProductDao(dbManager);
productDao.itemsNeededInitialiser();
module.exports = productDao;
