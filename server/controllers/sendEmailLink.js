const express = require('express');
const router = express.Router();
const { getAuth, sendSignInLinkToEmail } = require('firebase/auth');
const { adminAuth } = require('../lib/firebaseAdmin');
const app = require('../lib/firebaseConfig'); 
const auth = getAuth(app);

console.log("THESE ARE THE ONES", process.env.NEXT_PUBLIC_SERVER_URL, process.env.NEXT_PUBLIC_CLIENT_URL);

async function checkIfUserExists(email) {
  console.log('Checking if user exists:', email);
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return true;
  } catch (error) {
    console.log("what is it:" , error.message, "and ", error.code);
    if (error.code === 'auth/user-not-found') {
      return false;
    }
    else{console.log('Error checking user:', error.message)};
  }
}

router.post("/", async(req, res) => {    
  const { email } = req.body;
  const userExists = await checkIfUserExists(email);
  
  if (userExists) {
    res.status(400).json({ message: 'Email already registered!' });
  } else {
    console.log('new user!')
    const actionCodeSettings = {
      url: process.env.NEXT_PUBLIC_CLIENT_URL,
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      console.log('Email link sent!');
      res.status(200).json({ message: 'Email link sent!' });
    } catch (error) {
      console.log('Error sending Email:', error.message);
      res.status(500).json({ error: 'Error sending Email' });
    }
  }
});

module.exports = router;
