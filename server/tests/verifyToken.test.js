const request = require('supertest');
const express = require('express');
const verifyToken = require('../controllers/verifyToken');
const { verifyIdToken } = require('../lib/firebaseAdmin');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/verifyToken', verifyToken);

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => {
    const mockUserRecord = {
        token: 'valid-token',
    };
    
    const mockAuth = {
      apps: [],
      initializeApp: jest.fn(),
      credential: {
        cert: jest.fn(() => ({})), 
      },
      auth: jest.fn(() => ({    
        verifyIdToken: jest.fn().mockResolvedValue(mockUserRecord),
      })),
    };
  
    return mockAuth;
  });

const adminAuth = require('firebase-admin').auth();

describe('POST /verifyToken', () => {
  it('should verify a valid token and return the user and 200', async () => {
    const mockToken = 'valid-token';
    const mockDecodedToken = { uid: '123', email: 'test@example.com' };
    
    adminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

    const response = await request(app)
      .post('/verifyToken')
      .set('Authorization', `Bearer ${mockToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'Token verified',
      user: mockDecodedToken
    });
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).post('/verifyToken');
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'No token provided' });
  });

  it('should return 403 if the token is invalid', async () => {
    adminAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

    const response = await request(app)
      .post('/verifyToken')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ error: 'Invalid token' });
  });
});
