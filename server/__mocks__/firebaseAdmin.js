const mockServiceAccount = {
  project_id: 'mock-project-id',
  client_email: 'mock-client-email',
  private_key: 'mock-private-key',
 };

const mockAuth = {
  apps: [
    {
    name: '[DEFAULT]', 
    options: mockServiceAccount
    }
  ],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(() => mockServiceAccount),
  },
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
    getUserByEmail: jest.fn(),
  }),
};
  
module.exports = {
  ...mockAuth, // Spread the mockAuth object to include all properties
  auth: jest.fn(() => mockAuth.auth()), // Ensure auth method returns the right mock structure
};
  