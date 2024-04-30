const cors = require('cors');

const whitelist = ['http://localhost:3000', 'http://127.0.0.1:3000']; 

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
   
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204 
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
