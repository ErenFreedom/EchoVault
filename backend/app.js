const express = require('express');
const connectDB = require('./config/database'); // Adjust path as necessary
// Load environment variables

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json

// Routes
// Assuming you have an index file in your routes directory that exports all your routes
const routes = require('./routes');
app.use('/api', routes); // Prefix all routes with /api

// Export the app for use in server.js
module.exports = app;
