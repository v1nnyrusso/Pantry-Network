// Import nedb 
const nedb = require('gray-nedb');

// Create Product class
class Food {

    // Instantiate the database
    constructor(dbFilePath) {
        // Check if a database file path is provided
        if (dbFilePath) {
            // If a file path is provided, create a NeDB instance with the specified file
            this.db = new nedb({ filename: dbFilePath, autoload: true });
            console.log('DB Connected to ' + dbFilePath);
        } else {
            // If no file path is provided, create an in-memory NeDB instance
            this.db = new nedb();
        }
    }

    // Add seed method to insert some products
    init() {
        this.db.insert({
            type: 'vegetable',
            name: 'carrot',
            useByDate: '2024-04-17'

        });

        // Print to console
        console.log('db entry Carrot inserted');

        this.db.insert({
            type: 'fruit',
            name: 'apple',
            useByDate: '2024-04-18'
        });

        console.log('db entry Apple inserted');
    }

    // A function that returns all entries
    getAllEntries(){
        //return a Promise object, can be resolved or rejected
        return new Promise((resolve, reject) => {
            //use the find() method of the database to get the food data
            this.db.find({}, (err, entries) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(entries);
                    // Log all entries
                    console.log('function all() returns: ', entries);
                }
            })

        })

    }

}

// Export so it can be accessed in other files
module.exports = Food;


