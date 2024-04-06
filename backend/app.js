const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes'); // Ensure this includes your updated routes for OTP handling
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const lockerRoutes = require('./routes/lockerRoutes');
const dummyUserRoutes = require('./routes/dummyUserRoutes');
const permissionsRoutes = require('./routes/permissionRoutes');
const connectDB = require('./config/database');
const session = require('express-session');

const app = express();
require('dotenv').config();

// Database connection
connectDB().then(() => {
  console.log('MongoDB Connected...');
}).catch((error) => {
  console.error('Database connection failed:', error);
  process.exit(1);
});

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_DOMAIN || 'http://localhost:3000',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Sessions setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Ensure cookies are secure in production
    httpOnly: true, // Helps mitigate XSS attacks
  }
}));

// Routes
app.get('/', (req, res) => res.send('Server is running!'));
app.use('/api/users', userRoutes); // Ensure this is correctly linked to your user-related functionalities
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/dummy-users', dummyUserRoutes);
app.use('/api', permissionsRoutes); // Make sure permissions handling is correctly implemented


app.use(errorHandler); // Global error handling

module.exports = app;
