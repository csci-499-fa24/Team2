const express = require('express');
const router = express.Router();
const adminAuth = require('../lib/firebaseAdmin.js');

const checkIfUserExists = async(email) => {
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

router.get("/:email", async(req, res) => {
    const { email } = req.params;
    console.log('Checking if user exists:', email);
    const userExists = await checkIfUserExists(email);
    if (userExists) {
        res.status(200).json({ message: 'User exists' });
    }else {
        res.status(400).json({ message: 'User does not exist' });
    }
});

module.exports = router;