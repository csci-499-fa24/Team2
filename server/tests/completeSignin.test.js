const request = require('supertest');
const express = require('express');
const { signInWithEmailLink } = require('firebase/auth');
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

// Mock Firebase Auth, including getAuth, to prevent real initialization
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn().mockReturnValue({
        signInWithEmailLink: jest.fn(),
        isSignInWithEmailLink: jest.fn()
    }),
    signInWithEmailLink: jest.fn()
}));

/**
 * Test suite for /completeSignin route
 */
describe('POST /completeSignin', () => {
    it('should sign in the user with a valid email link', async () => {
        signInWithEmailLink.mockResolvedValue({ user: { email: 'test@example.com' } });
        const response = await request(app).post('/completeSignin').send({ email: 'test@example.com', url: 'valid-link' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Successfully signed in!', user: { email: 'test@example.com' } });
    });

    it('should return 500 on sign-in failure', async () => {
        signInWithEmailLink.mockRejectedValue(new Error('Sign-in failed'));
        const response = await request(app).post('/completeSignin').send({ email: 'test@example.com', url: 'invalid-link' });
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ error: 'Error signing in' });
    });
});
