const express = require('express');
const router = express.Router();
const { Jeopardy } = require('../models');

router.route('/')
    .get(async (req, res) => {
        try {
        const Jeopardies = await Jeopardy.findAll({
            attributes: ['show_number'],
            distinct: true,
            group: ['show_number']
        });
        res.status(200).json(Jeopardies);
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    })

router.route('/:show_number')
    .get(async (req,res) => {
        const {show_number} = req.params;
        console.log(show_number);
        try {
        const Jeopardies = await Jeopardy.findAll({
            where: { show_number: show_number}
        });
        res.status(200).json(Jeopardies);
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    })
module.exports = router;
