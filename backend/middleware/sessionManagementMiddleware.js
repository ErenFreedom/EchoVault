const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const UserSubscription = require('../models/UserSubscription');
const User = require('../models/UserModel');

// MongoDB session store setup
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI, 
  collection: 'mySessions',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
  }
});

store.on('error', function (error) {
  console.error('SESSION STORE ERROR:', error);
});

// Session middleware setup
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET, 
  cookie: {
    maxAge: 3600000,
    sameSite: 'strict',
  },
  store: store,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
});

// Middleware to check session validity and manage dummy user permissions
const checkSession = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'No active session found. Please log in.' });
  }
  
  if (req.session.userType === 'DummyUser') {
    const dummyUser = await User.findById(req.session.userId);
    if (!dummyUser || !dummyUser.linkedTo) {
      return res.status(403).json({ message: 'Dummy user not linked to any premium account.' });
    }

    const premiumUserSubscription = await UserSubscription.findOne({
      userId: dummyUser.linkedTo,
      isActive: true,
    }).populate('subscriptionId');

    if (!premiumUserSubscription || premiumUserSubscription.subscriptionId.planName !== 'PremiumLocker') {
      return res.status(403).json({ message: 'Linked premium account does not have an active premium subscription.' });
    }

    
  }

  next();
};

module.exports = {
  sessionMiddleware,
  checkSession
};
