const express = require('express');
const router = express.Router();
const JeopardyController = require('./jeopardy');
const createAccount = require('./createAccount');
const signInAccount = require('./signInAccount');

router.use('/jeopardy', JeopardyController);
router.use('/createAccount', createAccount);
router.use('/signInAccount', signInAccount);

module.exports = router;