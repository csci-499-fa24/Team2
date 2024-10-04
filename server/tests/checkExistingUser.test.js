const request = require('supertest');
const express = require('express');
const app = require('../server'); 
const adminAuth = require('../lib/firebaseAdmin');

jest.mock('firebase-admin', () => {
    jest.mock('firebase-admin', () => {
        const mockAuth = {
          apps: [],
          initializeApp: jest.fn(),
          credential: {
            cert: jest.fn(() => ({})),
          },
          auth: jest.fn(() => ({
            getUserByEmail: jest.fn().mockResolvedValue(mockUserRecord),
          })),
        };
      
        return {
            ...mockAuth,
            auth: () => mockAuth.auth(),
          };
      });
});

describe('GET /api/checkExistingUser/:email', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and user information if the user exists', async () => {
        const email = 'test@example.com';
        const mockUserRecord = {
        uid: '12345',
        };

        adminAuth.getUserByEmail.mockResolvedValue(mockUserRecord);

        const response = await request(app).get(`/api/checkExistingUser/${email}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'User exists');
        expect(response.body).toHaveProperty('uid', mockUserRecord.uid);
        expect(response.body.user).toEqual(mockUserRecord); 
    });

    it('should return 404 if the user does not exist', async () => {
        const email = 'nonexistent@example.com';

        // Provide the mock implementation for non-existing user
        adminAuth.getUserByEmail.mockRejectedValue(new Error('User not found'));

        const response = await request(app).get(`/api/checkExistingUser/${email}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User not found'); // Assuming you have this message for not found
    });
});