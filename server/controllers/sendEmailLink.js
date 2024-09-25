const express = require('express');
const { getAuth, sendSignInLinkToEmail } = require('firebase/auth');
const app = require('../lib/firebaseConfig'); 

const router = express.Router();
const auth = getAuth(app);

router.post("/", async (req, res) => {
    const { email } = req.body;
    console.log("GOT THE EMAIL AT /API/SEND-EMAIL-LINK", email);

    const actionCodeSettings = {
      url: 'http://localhost:3000/verify-email',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      res.status(200).json({ message: 'Email link sent!' });
    } catch (error) {
      res.status(500).json({ error: 'Error sending email link' });
    }
});

module.exports = router;
