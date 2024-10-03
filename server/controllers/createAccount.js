const express = require('express');
const router = express.Router();
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { adminAuth } = require('../lib/firebaseAdmin');
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
  
  if (userExists) {
    res.status(400).json({ message: 'Account already registered! Please sign in.' });
  } else {
    console.log('new user!')
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userID = user.uid;
        res.status(200).json({ message: 'Account created!', uid: userID });
    } catch (error) {
      console.log('Error creating account', error.message);
      res.status(500).json({ error: 'Error creating account' });
    }
  }
});

module.exports = router;
