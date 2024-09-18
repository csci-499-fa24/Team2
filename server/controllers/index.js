const express = require('express');
const router = express.Router();
const JeopardyController = require('./jeopardy');

router.use('/jeopardy', JeopardyController);
module.exports = router;