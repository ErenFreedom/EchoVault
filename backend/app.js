const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
// If errorHandler middleware could potentially cause issues or depends on not yet tested parts, consider commenting it out as well
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Environment variables setup
require('dotenv').config();

// Database Connection
connectDB();

// Essential Middlewares
app.use(helmet()); // Security-related headers
app.use(cors()); // CORS policy
app.use(express.json()); // Parse JSON bodies

// API routes setup
const routes = require('./routes/index'); // Assuming index.js correctly imports and exports your routes
app.use('/api', routes);

// Error handling middleware - keep if it's basic and shouldn't interfere with initial tests
app.use(errorHandler);

module.exports = app;
