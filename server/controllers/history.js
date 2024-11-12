const express = require('express');
const router = express.Router();
const { getPlayerHistory } = require('../lib/playerHistory');
const { recordGameHistory } = require('../lib/gameUtils');

// Route to get player history
router.get('/player_history/:playerId', async (req, res) => {
    console.log("Request received for player history:", req.params.playerId);
    const { playerId } = req.params;

    try {
        const gameHistory = await getPlayerHistory(playerId);
        res.status(200).json({ playerId, gameHistory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/record_game', async (req, res) => {
    console.log("Request received to record game:", req.body); // Log received data

    const {
        gameId,
        showNumber,
        owner,
        winner,
        points,
        players
    } = req.body;

    // Validate input
    if (!gameId || !showNumber || !owner || !winner || points === undefined || !Array.isArray(players)) {
        console.log("Invalid request data:", req.body); // Log invalid data for debugging
        return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    try {
        await recordGameHistory(gameId, showNumber, owner, winner, points, players);
        res.status(200).json({ message: 'Game recorded successfully' });
    } catch (error) {
        console.error('Error ending game:', error);
        res.status(500).json({ error: 'An error occurred while recording the game' });
    }
});


module.exports = router;