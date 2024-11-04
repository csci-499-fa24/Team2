const express = require('express');
const router = express.Router();

// API endpoint to get sample game history for a player
// todo remove dummy data
router.get('/player_history/:playerId', async (req, res) => {
    console.log("Request received for player history:", req.params.playerId);

    const { playerId } = req.params;

    // Sample game history data; this should come from your database in production
    const sampleGameHistory = [
        {
            game_id: 1,
            show_number: 1024,
            points: 2500,
            result: 'win',
            date: '2024-10-31'
        },
        {
            game_id: 2,
            show_number: 1025,
            points: 1500,
            result: 'lost',
            date: '2024-11-01'
        },
        {
            game_id: 3,
            show_number: 1024,
            points: 2500,
            result: 'win',
            date: '2024-10-31'
        },
        {
            game_id: 4,
            show_number: 1025,
            points: 1500,
            result: 'lost',
            date: '2024-11-01'
        },
        {
            game_id: 5,
            show_number: 1024,
            points: 2500,
            result: 'win',
            date: '2024-10-31'
        },
        {
            game_id: 2,
            show_number: 1025,
            points: 1500,
            result: 'lost',
            date: '2024-11-01'
        },
    ];

    res.status(200).json({ playerId, gameHistory: sampleGameHistory });
});