const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

// MongoDB session store setup
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/yourDatabaseName', // Replace with your MongoDB URI
  collection: 'mySessions',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000 // This is the MongoDB server selection timeout in milliseconds
  }
});

// Catch errors emitted by the session store
store.on('error', function (error) {
  console.error('SESSION STORE ERROR:', error);
});

// Session middleware setup
const sessionMiddleware = session({
  secret: 'yourSecretKey', // Replace with a real secret key
  cookie: {
    maxAge: 3600000, // Session expires after 1 hour of inactivity
    sameSite: 'strict', // Strict sameSite policy for the cookie
  },
  store: store,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy' // The session will be destroyed when the user logs out
});

// Middleware to check session validity
const checkSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'No active session found. Please log in.' });
  }
  // Check if the user is a dummy user
  const isDummyUser = req.session.userType === 'DummyUser';
  // Implement your logic to handle dummy user sessions if needed
  // ...
  
  next();
};

module.exports = {
  sessionMiddleware,
  checkSession
};
