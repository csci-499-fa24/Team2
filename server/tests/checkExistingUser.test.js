require('dotenv').config();
jest.mock('firebase-admin')

const request = require('supertest');
const app = require('../server'); 
const adminAuth = require('../lib/firebaseAdmin');

describe('GET /api/checkExistingUser/:email', () => {
    let getUserByEmail;

    beforeEach(() => {
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
        expect(response.body).toHaveProperty('message', 'User not found'); // Assuming you have this message for not found
    });
});