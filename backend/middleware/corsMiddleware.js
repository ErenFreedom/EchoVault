const cors = require('cors');

// List of allowed origins for CORS - you can include your front-end dev server address here
const whitelist = ['http://localhost:3000', 'http://127.0.0.1:3000']; // Add your other allowed origins

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This allows the browser to include cookies and authentication headers with requests
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Middleware to apply the CORS options
const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
