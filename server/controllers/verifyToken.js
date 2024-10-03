const express = require('express');
const router = express.Router();
const adminAuth = require('../lib/firebaseAdmin');

router.post("/", async(req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    console.log('User authenticated with ID:', uid);
    res.status(200).json({ message: 'User authenticated', uid });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

module.exports = router;