require('dotenv').config();
jest.mock('firebase-admin')

const request = require('supertest');
const app = require('../server');
const adminAuth = require('../lib/firebaseAdmin');

describe('POST /api/verifyToken', () => {
  let verifyIdToken;

  beforeEach(() => {
      jest.resetModules();

      jest.spyOn(adminAuth, 'auth').mockReturnValue({
          verifyIdToken: jest.fn(),
      });

      verifyIdToken = adminAuth.auth().verifyIdToken; // Access the mocked function
      if (verifyIdToken) {
          verifyIdToken.mockClear(); // Clear any previous calls
      } else {
          throw new Error('verifyIdToken is not defined');
      }  
  });

  afterEach(async() => {
    jest.clearAllMocks(); // Clear mocks after each test
    // jest.resetModules(); // Reset modules after each test
    // await db.sequelize.close();
  });

  it('should verify a valid token and return the user and 200', async () => {
    const mockToken = 'valid-token';
    const mockDecodedToken = { uid: '123'};
    
    verifyIdToken.mockResolvedValue(mockDecodedToken);

    const response = await request(app) 
      .post('/api/verifyToken')
      .send({token: mockToken});

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'User authenticated',
      uid: mockDecodedToken.uid
    });
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).post('/api/verifyToken');
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'No token provided' });
  });

  it('should return 403 if the token is invalid', async () => {
    verifyIdToken.mockRejectedValue(new Error('Invalid token'));

    const response = await request(app)
      .post('/api/verifyToken')
      .send({token: 'invalid-token'});
    
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ error: 'Invalid token' });
  });
});
