const admin = require('firebase-admin');
const serviceAccount = require('./firebaseAdminKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const adminAuth = admin.auth();
if (adminAuth) {
    console.log('Firebase Admin Initialized Successfully');
} else {
    console.error('Firebase Admin Initialization Failed');
}
module.exports = { adminAuth };
