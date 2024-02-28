const mongoose = require('mongoose');
const Document = require('../models/DocumentModel');
const connectDB = require('../config/database');

const documents = [
    { title: 'First Document', content: 'This is the first document.', ownerId: 'someUserId' },
    { title: 'Second Document', content: 'This is the second document.', ownerId: 'someUserId' }
];

const seedDocuments = async () => {
    try {
        await connectDB();
        await Document.deleteMany(); // Caution: This will delete all existing documents!
        await Document.insertMany(documents);
        console.log('Documents seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding documents:', error);
        process.exit(1);
    }
};

seedDocuments();
