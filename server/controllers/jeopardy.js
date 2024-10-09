const express = require('express');
const router = express.Router();
const { Jeopardy } = require('../models');

router.route('/')
    .get(async (req, res) => {
        try {
        const Jeopardies = await Jeopardy.findAll();
        res.status(200).json(Jeopardies);
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    })

module.exports = router;
