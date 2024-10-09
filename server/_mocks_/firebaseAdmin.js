const mockServiceAccount = {
  project_id: 'mock-project-id',
  client_email: 'mock-client-email',
  private_key: 'mock-private-key',
 };

const mockAuth = {
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(() => mockServiceAccount),
  },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    getUserByEmail: jest.fn(),
  })),
};
  
  module.exports = mockAuth;
  