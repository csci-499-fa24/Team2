const express = require('express');
const router = express.Router();
const adminAuth = require('../lib/firebaseAdmin');

router.post("/", async(req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    res.status(200).json({ message: 'User authenticated', uid });
  } catch (error) { 
    res.status(403).json({ error: 'Invalid token' });
  }
});

module.exports = router;