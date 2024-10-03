const express = require('express');
const router = express.Router();
const JeopardyController = require('./jeopardy');
const configFirebase = require('./configFirebase');
const createAccount = require('./createAccount');
const signInAccount = require('./signInAccount');

router.use('/jeopardy', JeopardyController);
router.use('/configFirebase', configFirebase);
router.use('/createAccount', createAccount);
router.use('/signInAccount', signInAccount);

module.exports = router;