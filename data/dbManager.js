const db = require('gray-nedb')

class DatabaseManager
{

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


const dbFilePath = ('./data/scottishPantryDb.db');

const dbManager = new DatabaseManager(dbFilePath);

module.exports = dbManager;