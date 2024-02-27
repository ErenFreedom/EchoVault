const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

module.exports = {
  helmet: helmet(),
  rateLimiter,
  corsOptions: cors(),
};
