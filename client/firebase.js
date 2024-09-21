import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  meaurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// // Send sign-in link to email
// const actionCodeSettings = {
//   url: 'http://localhost:3000/finishSignUp',
//   handleCodeInApp: true,
// };
// const sendLink = async (email) => {
//   try {
//     await sendSignInLinkToEmail(auth, email, actionCodeSettings);
//     window.localStorage.setItem('emailForSignIn', email);
//     console.log('Email link sent!');
//   } catch (error) {
//     console.error('Error sending link:', error.message);
//   }
// };

// // Verify and sign in using email link
// const completeSignIn = async (email) => {
//   if (isSignInWithEmailLink(auth, window.location.href)) {
//     try {
//       await signInWithEmailLink(auth, email, window.location.href);
//       window.localStorage.removeItem('emailForSignIn');
//       console.log('Successfully signed in!');
//     } catch (error) {
//       console.error('Error signing in:', error.message);
//     }
//   }
// };
