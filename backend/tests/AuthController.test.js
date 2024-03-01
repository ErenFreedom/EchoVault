const request = require('supertest');
const app = require('../app'); // Update this path to where your Express app is initialized
const User = require('../models/UserModel');
const EmailService = require('../services/EmailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../models/UserModel');
jest.mock('../services/EmailService');

describe('AuthController', () => {
  describe('registerUser', () => {
    beforeEach(() => {
      User.findOne.mockReset();
      User.prototype.save.mockReset();
      EmailService.sendEmail.mockReset();
    });

    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User.prototype.save.mockResolvedValue(true);
      EmailService.sendEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testUser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testUser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('loginUser', () => {
    beforeEach(() => {
      User.findOne.mockReset();
    });

    it('should login user successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      User.findOne.mockResolvedValue({
        _id: 'someUserId',
        email: 'test@example.com',
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User logged in successfully');
      expect(jwt.verify(response.body.token, process.env.JWT_SECRET).id).toBe('someUserId');
    });

    it('should return 400 for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid Credentials');
    });
  });

  // Additional tests for requestLockerAccess and verifyLockerOtp can follow a similar pattern
});
