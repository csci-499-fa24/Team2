require('dotenv').config();
jest.mock('firebase-admin')

const request = require('supertest');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require("../controllers");
const cors = require('cors')
app.use(cors({origin: "*"}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

    beforeEach(async() => {
        jest.resetModules();

        jest.spyOn(adminAuth, 'auth').mockReturnValue({
            getUserByEmail: jest.fn(),
        });

        getUserByEmail = adminAuth.auth().getUserByEmail; 
        if (getUserByEmail) {
            getUserByEmail.mockClear(); 
        } else {
            throw new Error('getUserByEmail is not defined');
        }  
    });
      
    afterEach(async() => {
        jest.clearAllMocks();
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
        expect(response.body).toHaveProperty('message', 'User not found'); 
    });
});