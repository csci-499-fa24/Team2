jest.mock('firebase-admin', () => ({
    credential: {
      cert: jest.fn().mockReturnValue({mockCredential: true}),
    },
    initializeApp: jest.fn(),
    app: jest.fn(),
    apps: [],
}));

const mockServiceAccount = {
project_id: 'mock-project-id',
client_email: 'mock-client-email',
private_key: 'mock-private-key',
client_id: 'mock-client-id',
auth_uri: 'https://accounts.google.com/o/oauth2/auth',
token_uri: 'https://oauth2.googleapis.com/token',
auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/mock-email',
};

jest.mock('../lib/firebaseAdminKey', () => (mockServiceAccount));
  
let adminAuth; 

describe('Firebase Admin Initialization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        adminAuth = require('firebase-admin');
    });

    it('should initialize Firebase Admin if no app exists', () => {
        adminAuth.apps = [];

        require('../lib/firebaseAdmin');

        expect(adminAuth.credential.cert).toHaveBeenCalledWith(mockServiceAccount);
        expect(adminAuth.initializeApp).toHaveBeenCalledWith({
        credential: expect.any(Object),
        });
    });

    it('should reuse the existing Firebase app if it exists', () => {
        adminAuth.apps = [{ name: '[DEFAULT]', options: {} }];

        require('../lib/firebaseAdmin');

        expect(adminAuth.initializeApp).not.toHaveBeenCalled();
        expect(adminAuth.app).toHaveBeenCalled();
        });
});
  