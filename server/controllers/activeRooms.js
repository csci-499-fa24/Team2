const express = require('express');
const router = express.Router();
const {ActiveRooms} = require("../models");

router.route('/')
    .get(async (req,res)=> {
        try {
            const activeRooms = await ActiveRooms.findAll();
            res.status(202).json(activeRooms);
        } catch {
            res.status(500).json({ error: err.message });
        }
    })

module.exports = router;