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

describe('GET /api/checkExistingUser/:email', () => {
    let getUserByEmail;
    let closeSockets;

    beforeEach(async() => {
        jest.resetModules();

        jest.spyOn(adminAuth, 'auth').mockReturnValue({
            getUserByEmail: jest.fn(),
        });

        getUserByEmail = adminAuth.auth().getUserByEmail; // Access the mocked function
        if (getUserByEmail) {
            getUserByEmail.mockClear(); // Clear any previous calls
        } else {
            throw new Error('getUserByEmail is not defined');
        }  

        // closeSockets = await startSocketServer();
    });
      
    afterEach(async() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        // Close the database connection
        // await closeSockets();
        // await sequelize.close();
    });

    it('should return 200 and user information if the user exists', async () => {
        const email = 'test@example.com';
        const mockUserRecord = {
        uid: '12345',
        };

        getUserByEmail.mockResolvedValue(mockUserRecord);

        const response = await request(app).get(`/api/checkExistingUser/${email}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'User exists');
        expect(response.body).toHaveProperty('uid', mockUserRecord.uid);
    });

    it('should return 404 if the user does not exist', async () => {
        const email = 'nonexistent@example.com';

        getUserByEmail.mockRejectedValue(new Error('User not found'));

        const response = await request(app).get(`/api/checkExistingUser/${email}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User not found'); // Assuming you have this message for not found
    });
});