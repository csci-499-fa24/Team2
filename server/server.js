require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const db = require('./models');
const app = express();
const initializeSockets = require('./socketServer');
const routes = require('./controllers');
const { endGame } = require('./lib/gameUtils'); // Import endGame function
const { setupWebRTCSocketServer } = require('./voiceChatServer');

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;
const server = http.createServer(app);

app.use("/api", routes);

global.activeGames = {}; // Define activeGames as a global variable
global.gameParticipants = {}; // New global variable to store participants by gameID

//gameParticipants looks like this:
// global.gameParticipants = {
//   "GAME123": {
//     "user001": { displayName: "Henry Danger" },
//     "user002": { displayName: "Jane Doe" }
//   },
//   "GAME456": {
//     "user003": { displayName: "Player One" },
//     "user004": { displayName: "Player Two" },
//     "user005": { displayName: "Player Three" }
//   }
// };

// Define cleanup interval and threshold for inactivity
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes

// Routine check for inactive games
setInterval(() => {
  const now = Date.now();
  for (const [gameId, game] of Object.entries(activeGames)) {
    if (now - game.lastActivity > INACTIVITY_THRESHOLD) {
      console.log(`Ending inactive game: ${gameId}`);
      endGame(gameId);
    }
  }
}, CLEANUP_INTERVAL);

// Database connection and server start
if (process.env.NODE_ENV !== 'test') {
  db.sequelize.sync().then(() => {
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    initializeSockets.setupSocketServer(server);
    setupWebRTCSocketServer(server);
  });
} else {
  console.log('Test environment: Server will not start.');
}

module.exports = { app, server };
