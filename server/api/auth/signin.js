import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  meaurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { email, oobCode } = req.body;
  
      if (isSignInWithEmailLink(auth, oobCode)) {
        try {
          const userCredential = await signInWithEmailLink(auth, email, oobCode);
          const user = userCredential.user;
          
          // Optionally, set a session or return a token
          res.status(200).json({ message: 'Successfully signed in!', user });
        } catch (error) {
          console.error('Error signing in:', error.message);
          res.status(400).json({ message: error.message });
        }
      } else {
        res.status(400).json({ message: 'Invalid email link!' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }