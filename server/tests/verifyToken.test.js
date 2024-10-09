require('dotenv').config();
jest.mock('firebase-admin')

const request = require('supertest');
// const {app, sequelize, startSocketServer} = require('../server');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require("../controllers");
const cors = require('cors')
app.use(cors({origin: "*"}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// const port = process.env.PORT || 8080;
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      isServerRunning = true;
  });
}
app.use("/api", routes);

const adminAuth = require('../lib/firebaseAdmin');

describe('POST /api/verifyToken', () => {
  let verifyIdToken;
  let closeSockets

  beforeEach(async() => {
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

      // closeSockets = await startSocketServer();
  });

  afterEach(async() => {
    jest.clearAllMocks(); // Clear mocks after each test
    // jest.resetModules(); // Reset modules after each test
    // await db.sequelize.close();
  });

  afterAll(async () => {
    // Close the database connection
    // await closeSockets();
    // await sequelize.close();
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
