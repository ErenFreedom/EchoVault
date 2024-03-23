const express = require('express');
const cors = require('cors');
const path = require('path');

const helmet = require('helmet');
const errorHandler = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const lockerRoutes = require('./routes/lockerRoutes');
const dummyUserRoutes = require('./routes/dummyUserRoutes'); 
const permissionsRoutes = require('./routes/permissionRoutes');
const connectDB = require('./config/database'); // Import the database connection function

const app = express();

require('dotenv').config();

// Connect to MongoDB
connectDB().then(() => {
  console.log('MongoDB Connected...');
}).catch((error) => {
  console.error('Database connection failed:', error);
  process.exit(1); // Optionally exit the process if unable to connect
});

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: 'auto' } // Set to 'auto' for automatic handling based on request protocol
}));



// Routes setup
app.get('/', (req, res) => {
  res.send('Server is running!');
});
// 
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/dummy-users', dummyUserRoutes);
app.use('/api', permissionsRoutes);
// Add more routes as needed
app.use(errorHandler);

module.exports = app;
