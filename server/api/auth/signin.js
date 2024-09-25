import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import app from '../../lib/firebaseConfig';

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