const adminAuth = require('firebase-admin');
const serviceAccount = require('./firebaseAdminKey.js');

// console.log('firebaseAdminKey:', serviceAccount);

if (!adminAuth.apps || !adminAuth.apps.length) {
  adminAuth.initializeApp({
    credential: adminAuth.credential.cert(serviceAccount),
  });
} else {
  adminAuth.app(); // Reuse existing app
}

module.exports = adminAuth;
