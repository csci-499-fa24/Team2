const express = require('express');
const router = express.Router();
const gameRoutes = require('./games');
const JeopardyController = require('./jeopardy');
const verifyToken = require('./verifyToken');
const checkExistingUser = require('./checkExistingUser');
const games = require('./games');
const history = require('./history');

router.use('/jeopardy', JeopardyController);
router.use('/verifyToken', verifyToken);
router.use('/checkExistingUser', checkExistingUser);
router.use('/games', gameRoutes);
 router.use('/history', history);
router.use('/', games);

module.exports = router;