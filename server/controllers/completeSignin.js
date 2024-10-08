const express = require('express');
const { getAuth, signInWithEmailLink } = require('firebase/auth');
const app = require('../lib/firebaseConfig'); 

const router = express.Router();
const auth = getAuth(app);

router.post('/', async(req, res) => {
    const { email, url } = req.body;
    try {
        const result = await signInWithEmailLink(auth, email, url);
        res.status(200).json({ message: 'Successfully signed in!', user: result.user });
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).json({ error: 'Error signing in' });
    }
});

module.exports = router;