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

function endGame(gameId) {
    delete activeGames[gameId];
}

function resolveGame(gameId) {
    endGame(gameId);
}

module.exports = {
    generateGameId,
    validateGame,
    getRandomShowNumber,
    getJeopardyData,
    removeGame,
    resolveGame,
    endGame
};
