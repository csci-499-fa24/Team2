const express = require('express');
const { getAuth, isSignInWithEmailLink, signInWithEmailLink } = require('firebase/auth');
const app = require('../lib/firebaseConfig');
const router = express.Router();
const auth = getAuth(app);

router.post("/", async(req, res) => {
    if (req.method === 'POST') {
      const { email, oobCode, url } = req.body;
  
      if (isSignInWithEmailLink(auth, url)) {
        try {
          const userCredential = await signInWithEmailLink(auth, email, url);
          const user = userCredential.user;
          
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
  });

  module.exports = router;