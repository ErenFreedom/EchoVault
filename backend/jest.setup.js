// jest.setup.js

// Set environment variables for testing
process.env.MONGODB_URI = 'mongodb://localhost:27017/your_test_db';
process.env.JWT_SECRET = 'your_test_jwt_secret';
process.env.EMAIL_USERNAME = 'test@example.com';
process.env.EMAIL_PASSWORD = 'testPassword';
