const db = require('../models');

// Function to get player history from the database
async function getPlayerHistory(playerId) {
    try {
        // Fetch player history with associated game details
        const playerGames = await db.player_history.findAll({
            where: { UserID: playerId },
            include: [
                {
                    model: db.game_history,
                    as: 'GameHistory', // Use the alias specified in the association
                    attributes: ['ShowNumber', 'GameDate'],
                    required: true
                }
            ]
        });

        // Format the results to a simpler structure
        return playerGames.map(game => ({
            game_id: game.GameID,
            show_number: game.GameHistory.ShowNumber,
            points: game.Points,
            result: game.Win ? 'win' : 'lost',
            date: game.GameHistory.GameDate
        }));
    } catch (error) {
        console.error('Error fetching player history:', error);
        throw new Error('Failed to retrieve player history');
    }
}

module.exports = {
    getPlayerHistory
};
