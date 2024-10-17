const express = require('express');
const { generateGameId, validateGame, getRandomShowNumber, getJeopardyData, removeGame, resolveGame, endGame } = require('../lib/gameUtils');
const router = express.Router();

let activeGames = {};

// API endpoint to start a new game
router.post('/start-game', async (req, res) => {
    let validGame = false;
    let showNumber = null;

    while (!validGame) {
        showNumber = await getRandomShowNumber();
        if (!showNumber) {
            return res.status(404).json({ message: 'No valid ShowNumber found in the database.' });
        }

        validGame = await validateGame(showNumber);
        if (!validGame) await removeGame(showNumber);
    }

    const jeopardyData = await getJeopardyData(showNumber);
    const gameId = generateGameId();

    activeGames[gameId] = {
        showNumber,
        questions: jeopardyData,
        lastActivity: Date.now(),
        warningSent: false,
        round: 'Jeopardy!'
    };

    res.status(200).json({ message: 'Game started', gameId, totalQuestions: jeopardyData.length });
});

// API endpoint to get all active game UIDs
router.get('/active-games', (req, res) => {
    const activeGameIds = Object.keys(activeGames);
    res.status(200).json({ activeGames: activeGameIds });
});

// API endpoint to get round info for a game
router.get('/round-info/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const game = activeGames[gameId];

    if (!game) {
        return res.status(404).json({ message: 'Game not found.' });
    }

    const currentRound = game.round;
    const questions = game.questions.filter(q => q.Round === currentRound);
    const categories = [...new Set(questions.map(q => q.Category))];
    const roundInfo = categories.map(category => {
        const categoryQuestions = questions.filter(q => q.Category === category);
        return {
            category,
            values: categoryQuestions.map(q => q.Value)
        };
    });

    res.status(200).json({ round: currentRound, roundInfo });
});

// API endpoint to get a specific question by category and value in the current round
router.get('/question/:gameId', (req, res) => {
    const { gameId } = req.params;
    const { category, value } = req.query;

    const game = activeGames[gameId];
    if (!game) {
        return res.status(404).json({ message: 'Game not found.' });
    }

    const question = game.questions.find(q => q.Category === category && q.Value == value);
    if (!question) {
        return res.status(404).json({ message: 'Question not found for the specified category and value.' });
    }

    res.status(200).json({
        question: question.Question,
        answer: question.Answer,
        category: question.Category,
        value: question.Value
    });
});

// API endpoint to move to the next round and return round info
router.post('/next-round/:gameId', (req, res) => {
    const { gameId } = req.params;
    const game = activeGames[gameId];

    if (!game) {
        return res.status(404).json({ message: 'Game not found.' });
    }

    if (game.round === 'Jeopardy!') {
        game.round = 'Double Jeopardy!';
    } else if (game.round === 'Double Jeopardy!') {
        game.round = 'Final Jeopardy!';
    } else if (game.round === 'Final Jeopardy!') {
        resolveGame(gameId);
        return res.status(200).json({ message: 'Game resolved and ended.' });
    } else {
        return res.status(400).json({ message: 'No further rounds available.' });
    }

    const questions = game.questions.filter(q => q.Round === game.round);
    const categories = [...new Set(questions.map(q => q.Category))];
    const roundInfo = categories.map(category => {
        const categoryQuestions = questions.filter(q => q.Category === category);
        return {
            category,
            values: categoryQuestions.map(q => q.Value)
        };
    });

    res.status(200).json({ round: game.round, roundInfo });
});

// API endpoint to manually end a game
router.post('/end-game/:gameId', (req, res) => {
    const { gameId } = req.params;

    if (!activeGames[gameId]) {
        return res.status(404).json({ message: 'Game not found.' });
    }

    endGame(gameId);
    res.status(200).json({ message: `Game ${gameId} has been ended.` });
});

module.exports = router;
