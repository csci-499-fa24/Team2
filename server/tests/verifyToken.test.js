require('dotenv').config();
jest.mock('firebase-admin')

const request = require('supertest');
const express = require('express');
const verifyToken = require('../controllers/verifyToken');
const adminAuth = require('../lib/firebaseAdmin');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/verifyToken', verifyToken);

describe('POST /verifyToken', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
    jest.resetModules(); // Reset modules after each test
  });

  it('should verify a valid token and return the user and 200', async () => {
    const mockToken = 'valid-token';
    const mockDecodedToken = { uid: '123'};
    
    adminAuth.auth().verifyIdToken.mockResolvedValue(mockDecodedToken);

    const response = await request(app) 
      .post('/verifyToken')
      .send({token: mockToken});
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'User authenticated',
      uid: mockDecodedToken.uid
    });
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).post('/verifyToken');
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'No token provided' });
  });

  it('should return 403 if the token is invalid', async () => {
    adminAuth.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

    const response = await request(app)
      .post('/verifyToken')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ error: 'Invalid token' });
  });
});
