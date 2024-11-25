const express = require("express");
const {
  generateGameId,
  validateGame,
  getRandomShowNumber,
  getJeopardyData,
  removeGame,
  resolveGame,
  endGame,
} = require("../lib/gameUtils");
const router = express.Router();

//let activeGames = {};

// API endpoint to start a new game
router.post("/start-game", async (req, res) => {
  const { isPrivate = false, maxPlayers = 4 } = req.body;
  let validGame = false;
  let showNumber = null;

  while (!validGame) {
    showNumber = await getRandomShowNumber();
    if (!showNumber) {
      return res
        .status(404)
        .json({ message: "No valid ShowNumber found in the database." });
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
    round: "Jeopardy!",
    isPrivate, // Store the new properties
    inProgress: false, // Always start with `inProgress` as false
    maxPlayers, // Store the new properties
  };

  res.status(200).json({
    message: "Game started",
    gameId,
    totalQuestions: jeopardyData.length,
  });
});

// API endpoint to get all active game UIDs with optional details
router.get("/active-games", (req, res) => {
  // Set default values for query parameters to 'false' to return only gameId by default
  const {
    includePrivate = "false",
    includeInProgress = "false",
    includeMaxPlayers = "false",
  } = req.query;

  const activeGamesData = Object.entries(activeGames).map(
    ([gameId, gameData]) => {
      const gameInfo = { gameId };

      if (includePrivate === "true") {
        gameInfo.isPrivate = gameData.isPrivate;
      }
      if (includeInProgress === "true") {
        gameInfo.inProgress = gameData.inProgress;
      }
      if (includeMaxPlayers === "true") {
        gameInfo.maxPlayers = gameData.maxPlayers;
      }

      return gameInfo;
    }
  );

  res.status(200).json({ activeGames: activeGamesData });
});

// API endpoint to get round info for a game
router.get("/round-info/:gameId", (req, res) => {
  const gameId = req.params.gameId;
  const game = activeGames[gameId];

  if (!game) {
    return res.status(404).json({ message: "Game not found." });
  }

  // Update the last activity timestamp
  game.lastActivity = Date.now();

  const currentRound = game.round;
  const questions = game.questions.filter((q) => q.Round === currentRound);
  const categories = [...new Set(questions.map((q) => q.Category))];
  const roundInfo = categories.map((category) => {
    const categoryQuestions = questions.filter((q) => q.Category === category);
    return {
      category,
      values: categoryQuestions.map((q) => q.Value),
    };
  });

  res.status(200).json({ round: currentRound, roundInfo });
});

// API endpoint to get a specific question by category and value in the current round
router.get("/question/:gameId", (req, res) => {
  const { gameId } = req.params;
  const { category, value } = req.query;

  const game = activeGames[gameId];
  if (!game) {
    return res.status(404).json({ message: "Game not found." });
  }

  // Update the last activity timestamp
  game.lastActivity = Date.now();

  const question = game.questions.find(
    (q) => q.Category === category && q.Value == value
  );
  if (!question) {
    return res.status(404).json({
      message: "Question not found for the specified category and value.",
    });
  }

  res.status(200).json({
    question: question.Question,
    answer: question.Answer,
    category: question.Category,
    value: question.Value,
  });
});

// API endpoint to move to the next round and return round info
router.post("/next-round/:gameId", (req, res) => {
  const { gameId } = req.params;
  const game = activeGames[gameId];

  if (!game) {
    return res.status(404).json({ message: "Game not found." });
  }

  // Update the last activity timestamp
  game.lastActivity = Date.now();

  if (game.round === "Jeopardy!") {
    game.round = "Double Jeopardy!";
  } else if (game.round === "Double Jeopardy!") {
    game.round = "Final Jeopardy!";
  } else if (game.round === "Final Jeopardy!") {
    resolveGame(gameId);
    return res.status(200).json({ message: "Game resolved and ended." });
  } else {
    return res.status(400).json({ message: "No further rounds available." });
  }

  const questions = game.questions.filter((q) => q.Round === game.round);
  const categories = [...new Set(questions.map((q) => q.Category))];
  const roundInfo = categories.map((category) => {
    const categoryQuestions = questions.filter((q) => q.Category === category);
    return {
      category,
      values: categoryQuestions.map((q) => q.Value),
    };
  });

  res.status(200).json({ round: game.round, roundInfo });
});

// Update the existing end-game endpoint
router.post("/end-game/:gameId", (req, res) => {
  const { gameId } = req.params;
  const { participantData } = req.body; // Expect participantData in request body

  if (!activeGames[gameId]) {
    return res.status(404).json({ message: "Game not found." });
  }

  if (!participantData || typeof participantData !== "object") {
    return res.status(400).json({ message: "Invalid participant data." });
  }

  endGame(gameId, participantData);
  res
    .status(200)
    .json({ message: `Game ${gameId} has been ended and cleaned up.` });
});

module.exports = router;

// API endpoint to mark a game as in progress
router.post("/set-in-progress/:gameId", (req, res) => {
  const { gameId } = req.params;
  const game = activeGames[gameId];

  if (!game) {
    return res.status(404).json({ message: "Game not found." });
  }

  game.inProgress = true;
  game.lastActivity = Date.now(); // Update last activity timestamp for tracking

  res.status(200).json({ message: `Game ${gameId} is now in progress.` });
});

// Add a participant to a game
router.post("/add-participant/:gameId", (req, res) => {
  const { gameId } = req.params;
  const { userId, displayName } = req.body;

  if (!userId || !activeGames[gameId]) {
    return res.status(400).json({ message: "Invalid game or user ID." });
  }

  if (!gameParticipants[gameId]) {
    gameParticipants[gameId] = {}; // Store participants as an object with userId keys
  }

  gameParticipants[gameId][userId] = { displayName }; // Store displayName with userId
  res.status(200).json({
    message: `User ${userId} (${displayName}) added to game ${gameId}.`,
  });
});

// Remove a participant from a game
router.post("/remove-participant/:gameId", (req, res) => {
  const { gameId } = req.params;
  const { userId, displayName } = req.body;

  if (!userId || !gameId) {
    return res.status(400).json({
      message: "Invalid game or user ID.",
    });
  }

  if (!gameParticipants[gameId]) {
    gameParticipants[gameId] = {};
  }

  if (gameParticipants[gameId][userId]) {
    delete gameParticipants[gameId][userId];
    res.status(200).json({
      message: `User ${userId} (${displayName}) removed from game ${gameId}.`,
    });
  } else {
    res.status(200).json({
      message: `User ${userId} was already removed or not found in game ${gameId}.`,
    });
  }
});
