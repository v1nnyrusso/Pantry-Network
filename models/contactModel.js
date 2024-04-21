const dbManager = require('../data/dbManager.js');



class Contact {
    constructor(dbManager) {
        if (dbManager) {
            this.dbManager = dbManager;
            console.log('Db connected to contact model');
        }
        else {
            throw new Error('No db manager provided');
        }
    }

    // Seed some contacts
    async contactInitialiser() {
        return new Promise((resolve, reject) => {
            const contacts = [
                {
                    _id: '1',
                    dataStore: 'Contact',
                    subject: 'John Doe',
                    contactEmail: 'tes4t@test.com',
                    contactMessage: 'Hello, I would like to donate some food to your pantry.',
                    dateSubmitted: new Date().toLocaleDateString('en-GB'),
                    status: 'unread',
                },
                {
                    _id: '2',
                    dataStore: 'Contact',
                    subject: 'Jane Doe',
                    contactEmail: 'test3@test.com',
                    contactMessage: 'Hello, I would like to volunteer at your pantry.',
                    dateSubmitted: new Date().toLocaleDateString('en-GB'),
                    status: 'unread',
                }
            ]

            contacts.forEach(contact => {
                this.dbManager.db.findOne({ _id: contact._id }, (err, obj) => {
                    if (err) {
                        console.error("Error finding contact:", err);
                        reject(err);
                        return;
                    }

                    if (obj) {
                        console.error("Contact already exists:", contact._id);
                        reject(new Error(`Contact already exists: ${contact._id}`));
                        return;
                    }

                    this.dbManager.db.insert(contact, (err, objs) => {
                        if (err) {
                            console.error("Error inserting contacts:", err);
                            reject(err);
                            return;
                        }
                    })
                })
            })

            resolve();

        })
    }

    // Create a contact message
    createContact(subject, contactEmail, contactMessage) {
        return new Promise((resolve, reject) => {
            const contact = {
                dataStore: 'Contact',
                subject: subject,
                contactEmail: contactEmail,
                contactMessage: contactMessage,
                status: 'unread',
                dateSubmitted: new Date().toLocaleDateString('en-GB')
            }

            this.dbManager.db.insert(contact, (err, obj) => {
                if (err) {
                    console.error("Error inserting contact:", err);
                    reject(err);
                    return;
                }

                console.log("Contact inserted successfully.");
                resolve(obj);
            });
        });
    }

    // Get the messages
    getMessages() {
        return new Promise((resolve, reject) => {
            this.dbManager.db.find({ dataStore: 'Contact' }, (err, obj) => {
                if (err) {
                    console.error("Error getting messages:", err);
                    reject(err);
                    return;
                }

                console.log("Messages retrieved successfully.");
                resolve(obj);
            });
        });
    }

    // Delete message
    deleteMessage(id) {
        return new Promise((resolve, reject) => {
            this.dbManager.db.remove({ _id: id }, { multi: false }, (err, numRemoved) => {
                if (err) {
                    console.error("Error deleting message:", err);
                    reject(err);
                    return;
                }

                console.log("Message deleted successfully.");
                resolve(numRemoved);
            });
        });
    }   


    // Search messages by email
    async searchMessagesByEmail(search) {
        try {
            // Search for messages by email
            return await new Promise((resolve, reject) => {
                this.dbManager.db.find({ dataStore: 'Contact', $or: [{ subject: { $regex: new RegExp(search, 'i') } }, { contactEmail: { $regex: new RegExp(search, 'i') } }, { contactMessage: { $regex: new RegExp(search, 'i') } }] }, (err, obj) => {
                    if (err) {
                        console.error("Error searching messages:", err);
                        reject(err);
                        return;
                    }
    
                    console.log("Messages searched successfully.");
                    resolve(obj);
                });
            });
        } catch (error) {
            throw new Error(`Error searching messages by email: ${error}`);
        }
    }



    // Status of message now read
    markRead(id) {
        return new Promise((resolve, reject) => {
            this.dbManager.db.update({ _id: id }, { $set: { status: 'read' } }, {}, (err, numReplaced) => {
                if (err) {
                    console.error("Error marking message as read:", err);
                    reject(err);
                    return;
                }

                console.log("Message marked as read successfully.");
                resolve(numReplaced);
            });
        });
    }
}




// Create a new contact object, Export it
const contact = new Contact(dbManager);
contact.contactInitialiser();
module.exports = contact;