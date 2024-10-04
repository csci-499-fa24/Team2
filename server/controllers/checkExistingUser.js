const express = require('express');
const router = express.Router();
const adminAuth = require('../lib/firebaseAdmin.js');

router.get("/:email", async(req, res) => {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: 'No email provided' });
    }

    try{
      const userRecord = await adminAuth.getUserByEmail(email);
      console.log("userRecord", userRecord);
      res.status(200).json({ message: 'User exists', uid: userRecord.uid });
    }catch(error){
      res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;