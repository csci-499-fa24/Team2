const request = require('supertest');
const express = require('express');
const { getAuth, signInWithEmailLink, isSignInWithEmailLink } = require('firebase/auth');
const indexRouter = require('../controllers/index');

const app = express();
app.use(express.json());
app.use('/', indexRouter);

// Mock Firebase Admin to prevent real initialization during tests
jest.mock('firebase-admin', () => ({
    credential: {
        cert: jest.fn()
    },
    initializeApp: jest.fn(),
    auth: jest.fn().mockReturnValue({
        getUserByEmail: jest.fn(),
        createUser: jest.fn(),
        deleteUser: jest.fn()
    })
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    signInWithEmailLink: jest.fn(),
    isSignInWithEmailLink: jest.fn()
}));

/**
 * Test routes in index.js
 */
describe('POST /signin', () => {
    it('should route to /signin', async () => {
        isSignInWithEmailLink.mockReturnValue(true);
        signInWithEmailLink.mockResolvedValue({ user: { email: 'test@example.com' } });

        const response = await request(app).post('/signin').send({ email: 'test@example.com', url: 'valid-link' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Successfully signed in!', user: { email: 'test@example.com' } });
    });
});
