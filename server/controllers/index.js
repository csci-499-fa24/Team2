const express = require('express');
const router = express.Router();
const JeopardyController = require('./jeopardy');
const SendEmailLink = require('./sendEmailLink');
const CompleteSignIn = require('./completeSignin');
const configFirebase = require('./configFirebase');
const signin = require('./signin');

router.use('/jeopardy', JeopardyController);
router.use('/sendEmailLink', SendEmailLink);
router.use('/completeSignIn', CompleteSignIn);
router.use('/configFirebase', configFirebase);
router.use('/signin', signin);
module.exports = router;