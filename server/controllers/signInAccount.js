const express = require('express');
const router = express.Router();
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const app = require('../lib/firebaseConfig'); 
const auth = getAuth(app);

async function checkIfUserExists(email) {
    console.log('Checking if user exists:', email);
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      return true;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return false;
      }
      else{console.log('Error checking user:', error.message)};
    }
  }

router.post("/", async(req, res) => {    
  const { email, password } = req.body;
  const userExists = await checkIfUserExists(email);
  
  if (!userExists) {
    res.status(400).json({ message: 'Account not found in system. Please create an account!' });
  } else {
    try {
      signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        res.status(200).json({ message: 'Successfully signed in!' });
      })
    } catch (error) {
      console.log('Error signing in', error.message);
      res.status(500).json({ error: 'Error signing in' });
    }
  }
});

module.exports = router;