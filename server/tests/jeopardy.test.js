const request = require('supertest');
const express = require('express');
const { Jeopardy } = require('../models'); // Ensure this path is correct for your model import
const indexRouter = require('../controllers/index');

const app = express();
app.use(express.json());
app.use('/', indexRouter);

jest.mock('../models', () => ({
  Jeopardy: {
    findAll: jest.fn()
  }
}));

/**
 * Test suite for /jeopardy route
 */
describe('GET /jeopardy', () => {
  it('should return all Jeopardy records including the test entry', async () => {
    const mockJeopardies = [
      {
        show_number: 3,
        round: 'Jeopardy!',
        category: '3-LETTER WORDS',
        value: 100,
        question: 'A fedora, homburg or derby',
        answer: 'hat'
      }
    ];

    Jeopardy.findAll.mockResolvedValue(mockJeopardies);

    const response = await request(app).get('/jeopardy');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockJeopardies);
  });

  it('should return 500 on database error', async () => {
    Jeopardy.findAll.mockRejectedValue(new Error('Database error'));
    const response = await request(app).get('/jeopardy');
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Database error' });
  });
});