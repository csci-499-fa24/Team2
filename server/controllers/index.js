const express = require('express');
const router = express.Router();
const JeopardyController = require('./jeopardy');
const verifyToken = require('./verifyToken');
const checkExistingUser = require('./checkExistingUser');

router.use('/jeopardy', JeopardyController);
router.use('/verifyToken', verifyToken);
router.use('/checkExistingUser', checkExistingUser);

module.exports = router;