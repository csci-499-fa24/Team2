require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const db = require('./models');
const cors = require('cors');
const app = express();
const routes = require("./controllers");
const initializeSockets = require('./socketServer');
const http = require('http');
const { v4: uuidv4 } = require('uuid'); // For generating unique game IDs

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;
const server = http.createServer(app);

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

let activeGames = {}; // To store ongoing games and their data
const GAME_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const GAME_WARNING_TIME = 1 * 60 * 1000; // 1 minute after the warning

// Function to validate a game based on the Jeopardy! structure
async function validateGame(showNumber) {
    const jeopardyData = await getJeopardyData(showNumber);

    // Separate the rounds for validation
    const jeopardyRound = jeopardyData.filter(q => q.Round === 'Jeopardy!');
    const doubleJeopardyRound = jeopardyData.filter(q => q.Round === 'Double Jeopardy!');
    const finalJeopardyRound = jeopardyData.filter(q => q.Round === 'Final Jeopardy!');

    // Debugging prints
    console.log(`Debug: ShowNumber ${showNumber} - Jeopardy! questions: ${jeopardyRound.length}`);
    console.log(`Debug: ShowNumber ${showNumber} - Double Jeopardy! questions: ${doubleJeopardyRound.length}`);
    console.log(`Debug: ShowNumber ${showNumber} - Final Jeopardy! questions: ${finalJeopardyRound.length}`);

    // Check Jeopardy! and Double Jeopardy! rounds
    const jeopardyCategories = [...new Set(jeopardyRound.map(q => q.Category))];
    const doubleJeopardyCategories = [...new Set(doubleJeopardyRound.map(q => q.Category))];

    if (jeopardyCategories.length !== 6 || doubleJeopardyCategories.length !== 6) {
        console.log('Debug: Invalid number of categories for Jeopardy or Double Jeopardy.');
        return false;
    }

    if (!jeopardyCategories.every(cat => jeopardyRound.filter(q => q.Category === cat).length === 5) ||
        !doubleJeopardyCategories.every(cat => doubleJeopardyRound.filter(q => q.Category === cat).length === 5)) {
        console.log('Debug: Invalid number of questions per category.');
        return false;
    }

    // Check Final Jeopardy!
    if (finalJeopardyRound.length !== 1 || new Set(finalJeopardyRound.map(q => q.Category)).size !== 1) {
        console.log('Debug: Invalid Final Jeopardy! round.');
        return false;
    }

    console.log('Debug: Game validated successfully.');
    return true;
}

// Utility function to get a random ShowNumber using Sequelize
async function getRandomShowNumber() {
    try {
        const shows = await db.jeopardy.findAll({ attributes: ['ShowNumber'], group: ['ShowNumber'] });
        if (shows.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * shows.length);
        return shows[randomIndex].ShowNumber;
    } catch (error) {
        console.error('Error fetching random ShowNumber:', error);
        return null;
    }
}

// Utility function to get all data for a specific ShowNumber using Sequelize
async function getJeopardyData(showNumber) {
    try {
        const questions = await db.jeopardy.findAll({ where: { ShowNumber: showNumber } });
        return questions;
    } catch (error) {
        console.error('Error fetching jeopardy data:', error);
        return [];
    }
}

// Function to remove a game from the database
async function removeGame(showNumber) {
    try {
        await db.jeopardy.destroy({ where: { ShowNumber: showNumber } });
        console.log(`Debug: Removed all entries for ShowNumber ${showNumber}`);
    } catch (error) {
        console.error(`Error removing ShowNumber ${showNumber}:`, error);
    }
}

// Function to end a game and remove its data
function endGame(gameId) {
    delete activeGames[gameId];
    console.log(`Game ${gameId} ended and data removed.`);
}

// Function to check for expired games and remove them after inactivity
function checkForExpiredGames() {
    const currentTime = Date.now();
    Object.keys(activeGames).forEach(gameId => {
        const game = activeGames[gameId];
        if (currentTime - game.lastActivity > GAME_EXPIRY_TIME) {
            if (game.warningSent && currentTime - game.lastActivity > GAME_EXPIRY_TIME + GAME_WARNING_TIME) {
                endGame(gameId);
            } else if (!game.warningSent) {
                game.warningSent = true;
                console.log(`Warning: Game ${gameId} is inactive. It will be ended if no activity occurs within one minute.`);
            }
        }
    });
}

// Set up an interval to check for expired games every minute
setInterval(checkForExpiredGames, 60 * 1000);

// API endpoint to start a new game with a random ShowNumber
app.post('/api/start-game', async (req, res) => {
    let validGame = false;
    let showNumber = null;

    while (!validGame) {
        showNumber = await getRandomShowNumber();
        if (!showNumber) {
            return res.status(404).json({ message: 'No valid ShowNumber found in the database.' });
        }

        // Validate the selected ShowNumber
        validGame = await validateGame(showNumber);

        // If invalid, remove the game and select a new ShowNumber
        if (!validGame) {
            await removeGame(showNumber);
        }
    }

    const jeopardyData = await getJeopardyData(showNumber);
    const gameId = uuidv4(); // Generate a unique game ID

    activeGames[gameId] = {
        showNumber,
        questions: jeopardyData,
        lastActivity: Date.now(),
        warningSent: false,
        round: 'Jeopardy!' // Start with the first round
    };

    res.status(200).json({ message: 'Game started', gameId, totalQuestions: jeopardyData.length });
});

// Function to provide category and point values for each round
app.get('/api/round-info/:gameId', (req, res) => {
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

    // Debugging prints
    console.log(`Debug: Round info for game ${gameId}:`, roundInfo);

    res.status(200).json({ round: currentRound, roundInfo });
});

// Start the server and sync the database
db.sequelize.sync().then(() => {
    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
    initializeSockets(server);
});

app.use("/api", routes);