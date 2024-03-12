const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorMiddleware');
const app = express();

// Environment variables setup
require('dotenv').config();

// Database Connection
connectDB();

// Middlewares
app.use(helmet()); // Helps secure your app by setting various HTTP headers
app.use(cors()); // Enables CORS with various options
app.use(express.json()); // Parse JSON bodies

// API routes
const routes = require('./routes/index'); // Make sure to have an index.js that collects all routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
