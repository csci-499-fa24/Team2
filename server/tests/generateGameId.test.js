const { generateGameId } = require('../server');
const db = require('../models');

// Mocking Firebase Admin if it is being initialized somewhere in the test.
jest.mock('../lib/firebaseAdmin', () => ({
  initializeApp: jest.fn(() => {
    console.log('Mock Firebase Admin Initialized');
  }),
}));

describe('generateGameId', () => {
  beforeAll(async () => {
    // Prevent Firebase Admin from running during tests
    console.log('Test environment: Firebase Admin will not be started.');

    // Mock or initialize anything before tests
    if (db.sequelize && db.sequelize.authenticate) {
      await db.sequelize.authenticate(); // Only authenticate if a real Sequelize instance exists
    }
  });

  afterAll(async () => {
    // Close the database connection after the tests if available
    if (db.sequelize && db.sequelize.close) {
      await db.sequelize.close();
    }
  });

  it('should generate a 6-character alphanumeric ID', () => {
    const gameId = generateGameId();
    expect(gameId).toHaveLength(6);
    expect(gameId).toMatch(/^[A-Z0-9]{6}$/);
  });
});