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
    const participants = gameParticipants[gameId] || {};

    // Create the players array with points from participantData
    const players = Object.entries(participants).map(([userId, participant]) => {
        const displayName = participant.displayName;
        const points = participantData[displayName] || 0;
        return {
            userId,
            displayName: displayName || userId,
            points
        };
    });

    // Determine winner by highest points
    let owner = null;
    let winner = null;
    let highestPoints = -Infinity;

    for (const player of players) {
        if (player.points > highestPoints) {
            highestPoints = player.points;
            owner = player.displayName;
            winner = player.displayName;
        }
    }

    // If no players or no winner found, fall back to a placeholder
    if (!owner) owner = "No Owner";
    if (!winner) winner = "No Winner";

    // Mark the winning player(s)
    const finalPlayers = players.map(p => ({
        ...p,
        win: p.displayName === winner
    }));

    // Record the game in the database
    recordGameHistory(
        gameId,
        game.showNumber,
        owner,
        winner,
        highestPoints > 0 ? highestPoints : 0,
        finalPlayers
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
            GameDate: new Date()
        });

        // Add each player's details to player_history
        const playerHistoryRecords = players.map(player => ({
            GameID: gameHistory.GameID,
            UserID: player.userId,
            Win: player.win,
            Points: player.points
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