const db = require('../models');

// Generate a unique 6-character alphanumeric game ID
function generateGameId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let gameId;

    do {
        gameId = '';
        for (let i = 0; i < 6; i++) {
            gameId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (activeGames[gameId]);

    return gameId;
}

async function validateGame(showNumber) {
    const jeopardyData = await getJeopardyData(showNumber);
    const jeopardyRound = jeopardyData.filter(q => q.Round === 'Jeopardy!');
    const doubleJeopardyRound = jeopardyData.filter(q => q.Round === 'Double Jeopardy!');
    const finalJeopardyRound = jeopardyData.filter(q => q.Round === 'Final Jeopardy!');

    const jeopardyCategories = [...new Set(jeopardyRound.map(q => q.Category))];
    const doubleJeopardyCategories = [...new Set(doubleJeopardyRound.map(q => q.Category))];

    if (jeopardyCategories.length !== 6 || doubleJeopardyCategories.length !== 6) {
        return false;
    }

    if (!jeopardyCategories.every(cat => jeopardyRound.filter(q => q.Category === cat).length === 5) ||
        !doubleJeopardyCategories.every(cat => doubleJeopardyRound.filter(q => q.Category === cat).length === 5)) {
        return false;
    }

    if (finalJeopardyRound.length !== 1 || new Set(finalJeopardyRound.map(q => q.Category)).size !== 1) {
        return false;
    }

    return true;
}

async function getRandomShowNumber() {
    try {
        const shows = await db.jeopardy_questions.findAll({
            attributes: ['ShowNumber'],
            group: ['ShowNumber']
        });
        if (shows.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * shows.length);
        return shows[randomIndex].ShowNumber;
    } catch (error) {
        console.error('Error fetching random ShowNumber:', error);
        return null;
    }
}

async function getJeopardyData(showNumber) {
    try {
        const questions = await db.jeopardy_questions.findAll({ where: { ShowNumber: showNumber } });
        return questions;
    } catch (error) {
        console.error('Error fetching jeopardy data:', error);
        return [];
    }
}

async function removeGame(showNumber) {
    try {
        await db.jeopardy_questions.destroy({ where: { ShowNumber: showNumber } });
    } catch (error) {
        console.error(`Error removing ShowNumber ${showNumber}:`, error);
    }
}

// Updated endGame function to handle userID, displayName, and points
function endGame(gameId, participantData) {
    if (!activeGames[gameId]) return;

    const game = activeGames[gameId];
    const participants = gameParticipants[gameId] || new Set();

    const players = Array.from(participants).map(userId => {
        const displayName = Object.keys(participantData[gameId] || {}).find(name => participantData[gameId][name]);
        const points = participantData[gameId]?.[displayName]?.money || 0;

        return {
            userId,
            displayName: displayName || userId, // Fallback to userId if displayName is missing
            win: false, // Set to true later if this user is marked as the winner
            points
        };
    });

    // Record the game in the database
    recordGameHistory(
        gameId,
        game.showNumber,
        game.owner || null,
        game.winner || null,
        game.points || 0,
        players
    );

    delete activeGames[gameId];
    delete gameParticipants[gameId]; // Remove participants
}

function resolveGame(gameId) {
    endGame(gameId);
}

async function recordGameHistory(gameId, showNumber, owner, winner, points, players) {
    try {
        // Create a new game record in game_history
        const gameHistory = await db.game_history.create({
            ShowNumber: showNumber,
            Owner: owner,
            Winner: winner,
            Points: points,
            GameDate: new Date() // Use the current date/time
        });

        // Add each player's details to player_history
        const playerHistoryRecords = players.map(player => ({
            GameID: gameHistory.GameID, // Link to the newly created game
            UserID: player.userId, // User ID of the player
            Win: player.win, // Boolean indicating if the player won
            Points: player.points // Points scored by the player
        }));

        await db.player_history.bulkCreate(playerHistoryRecords);

        // Remove game from activeGames
        delete activeGames[gameId];
    } catch (error) {
        console.error(`Error ending game with ID ${gameId}:`, error);
    }
}

module.exports = {
    generateGameId,
    validateGame,
    getRandomShowNumber,
    getJeopardyData,
    removeGame,
    resolveGame,
    endGame,
    recordGameHistory
};
