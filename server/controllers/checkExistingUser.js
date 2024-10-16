const express = require('express');
const router = express.Router();
const adminAuth = require('../lib/firebaseAdmin.js');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get("/:email", async(req, res) => {
    const { email } = req.params;
    if (!emailRegex.test(email)) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    try{
      const userRecord = await adminAuth.auth().getUserByEmail(email);
      res.status(200).json({ message: 'User exists', uid: userRecord.uid });
    }catch(error){
      res.status(400).json({ message: 'User not found' });
    }
});

module.exports = router;