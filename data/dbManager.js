// Import gray-nedb module to use as database
const db = require('gray-nedb')

// Database Manager class
class DatabaseManager
{
    // Constructor for the Database Manager
    constructor(dbFilePath){
        if(dbFilePath){
            this.db = new db({filename: dbFilePath, autoload: true});
            console.log('DB Connected to '+ dbFilePath);

        }
        
        else{

            this.db = new db();
            console.log('DB Connected to in-memory');
        }
    }
}

// Export the Database Manager
const dbFilePath = ('./data/scottishPantryDb.db');
const dbManager = new DatabaseManager(dbFilePath);
module.exports = dbManager;