const { initializeApp, getApp, getApps } = require('firebase/app');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  meaurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp(); 
}

module.exports = app;
