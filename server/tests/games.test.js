const request = require("supertest");
const express = require("express");
const gamesRouter = require("../controllers/games");
const {
  generateGameId,
  validateGame,
  getRandomShowNumber,
  getJeopardyData,
  endGame,
} = require("../lib/gameUtils");

// Mock the gameUtils functions
jest.mock("../lib/gameUtils");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/", gamesRouter);

// Mock the global objects
global.activeGames = {};
global.gameParticipants = {};
global.io = { emit: jest.fn() };

describe("Games Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.activeGames = {};
    global.gameParticipants = {};

    // Set up common mocks
    generateGameId.mockReturnValue("TEST123");
    getRandomShowNumber.mockResolvedValue("123");
    validateGame.mockResolvedValue(true);
    getJeopardyData.mockResolvedValue([
      { Round: "Jeopardy!", Category: "TEST", Value: 200 },
    ]);
  });

  describe("POST /start-game", () => {
    it("should start a new game successfully", async () => {
      const response = await request(app)
        .post("/start-game")
        .send({ maxPlayers: 4 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Game started",
        gameId: "TEST123",
        totalQuestions: 1,
      });
      expect(global.activeGames.TEST123).toBeDefined();
    });

    it("should handle invalid show number", async () => {
      getRandomShowNumber.mockResolvedValue(null);

      const response = await request(app)
        .post("/start-game")
        .send({ maxPlayers: 4 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "No valid ShowNumber found in the database."
      );
    });

    it("should retry validation until valid game is found", async () => {
      validateGame
        .mockResolvedValueOnce(false) // First attempt fails
        .mockResolvedValueOnce(true); // Second attempt succeeds
      getRandomShowNumber
        .mockResolvedValueOnce("123") // First show number
        .mockResolvedValueOnce("124"); // Second show number

      const response = await request(app)
        .post("/start-game")
        .send({ maxPlayers: 4 });

      expect(response.status).toBe(200);
      expect(validateGame).toHaveBeenCalledTimes(2);
      expect(getRandomShowNumber).toHaveBeenCalledTimes(2);
    });
  });

  describe("GET /active-games", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          isPrivate: false,
          inProgress: false,
          maxPlayers: 4,
        },
        PRIV456: {
          isPrivate: true,
          inProgress: false,
          maxPlayers: 6,
        },
      };
    });

    it("should return basic game info by default", async () => {
      const response = await request(app).get("/active-games");

      expect(response.status).toBe(200);
      expect(response.body.activeGames).toHaveLength(2);
      expect(response.body.activeGames[0]).toEqual({
        gameId: "TEST123",
      });
    });

    it("should include additional info when requested", async () => {
      const response = await request(app).get(
        "/active-games?includePrivate=true&includeInProgress=true&includeMaxPlayers=true"
      );

      expect(response.status).toBe(200);
      expect(response.body.activeGames[0]).toEqual({
        gameId: "TEST123",
        isPrivate: false,
        inProgress: false,
        maxPlayers: 4,
      });
    });

    it("should handle no active games", async () => {
      global.activeGames = {};
      const response = await request(app).get("/active-games");

      expect(response.status).toBe(200);
      expect(response.body.activeGames).toHaveLength(0);
    });
  });

  describe("GET /round-info/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          round: "Jeopardy!",
          questions: [
            { Round: "Jeopardy!", Category: "TEST1", Value: 200 },
            { Round: "Jeopardy!", Category: "TEST1", Value: 400 },
            { Round: "Double Jeopardy!", Category: "TEST2", Value: 800 },
          ],
          lastActivity: Date.now(),
        },
      };
    });

    it("should return round info for valid game", async () => {
      const response = await request(app).get("/round-info/TEST123");

      expect(response.status).toBe(200);
      expect(response.body.round).toBe("Jeopardy!");
      expect(response.body.roundInfo).toBeDefined();
    });

    it("should handle non-existent game", async () => {
      const response = await request(app).get("/round-info/INVALID");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
    });

    it("should handle game with no questions", async () => {
      global.activeGames.TEST123.questions = [];
      const response = await request(app).get("/round-info/TEST123");

      expect(response.status).toBe(200);
      expect(response.body.round).toBe("Jeopardy!");
      expect(response.body.roundInfo).toEqual([]);
    });

    it("should only return questions from current round", async () => {
      const response = await request(app).get("/round-info/TEST123");

      expect(response.status).toBe(200);
      expect(response.body.roundInfo).toHaveLength(1);
      expect(response.body.roundInfo[0].values).toHaveLength(2);
    });

    it("should handle multiple questions in same category", async () => {
      global.activeGames = {
        TEST123: {
          round: "Jeopardy!",
          questions: [
            { Round: "Jeopardy!", Category: "TEST1", Value: 200 },
            { Round: "Jeopardy!", Category: "TEST1", Value: 400 },
            { Round: "Jeopardy!", Category: "TEST1", Value: 600 },
          ],
          lastActivity: Date.now(),
        },
      };

      const response = await request(app).get("/round-info/TEST123");

      expect(response.status).toBe(200);
      expect(response.body.roundInfo).toHaveLength(1);
      expect(response.body.roundInfo[0].values).toHaveLength(3);
      expect(response.body.roundInfo[0].category).toBe("TEST1");
    });
  });

  describe("POST /next-round/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          round: "Jeopardy!",
          questions: [
            { Round: "Double Jeopardy!", Category: "TEST", Value: 400 },
          ],
          lastActivity: Date.now(),
        },
      };
    });

    it("should advance to next round", async () => {
      const response = await request(app).post("/next-round/TEST123");

      expect(response.status).toBe(200);
      expect(response.body.round).toBe("Double Jeopardy!");
    });

    it("should end game after Final Jeopardy", async () => {
      global.activeGames.TEST123.round = "Final Jeopardy!";

      const response = await request(app).post("/next-round/TEST123");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Game resolved and ended.");
    });

    it("should handle invalid round transition", async () => {
      global.activeGames = {
        TEST123: {
          round: "Invalid Round",
          questions: [],
          lastActivity: Date.now(),
        },
      };

      const response = await request(app).post("/next-round/TEST123");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("No further rounds available.");
    });

    it("should handle non-existent game", async () => {
      const response = await request(app).post("/next-round/INVALID");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
    });

    it("should transition from Double Jeopardy! to Final Jeopardy!", async () => {
      global.activeGames.TEST123.round = "Double Jeopardy!";

      const response = await request(app).post("/next-round/TEST123");

      expect(response.status).toBe(200);
      expect(response.body.round).toBe("Final Jeopardy!");
    });
  });

  describe("POST /end-game/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          round: "Jeopardy!",
          questions: [],
        },
      };
      global.gameParticipants = {
        TEST123: { user1: { displayName: "Player 1" } },
      };
    });

    it("should end game successfully", async () => {
      const participantData = {
        TEST123: {
          "Player 1": { money: 1000 },
        },
      };

      const response = await request(app)
        .post("/end-game/TEST123")
        .send({ participantData });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Game TEST123 has been ended and cleaned up."
      );
      expect(endGame).toHaveBeenCalledWith("TEST123", participantData);
    });

    it("should handle invalid game ID", async () => {
      const response = await request(app)
        .post("/end-game/INVALID")
        .send({ participantData: {} });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
    });

    it("should handle invalid participant data", async () => {
      global.activeGames = {
        TEST123: {
          round: "Jeopardy!",
          questions: [],
        },
      };

      const response = await request(app)
        .post("/end-game/TEST123")
        .send({ participantData: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid participant data.");
    });
  });

  describe("POST /set-in-progress/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          inProgress: false,
          lastActivity: Date.now(),
        },
      };
    });

    it("should mark game as in progress", async () => {
      const response = await request(app).post("/set-in-progress/TEST123");

      expect(response.status).toBe(200);
      expect(global.activeGames.TEST123.inProgress).toBe(true);
    });

    it("should handle non-existent game", async () => {
      const response = await request(app).post("/set-in-progress/INVALID");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
    });

    it("should handle already in-progress game", async () => {
      global.activeGames.TEST123.inProgress = true;
      const response = await request(app).post("/set-in-progress/TEST123");

      expect(response.status).toBe(200);
      expect(global.activeGames.TEST123.inProgress).toBe(true);
    });
  });

  describe("POST /add-participant/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {},
      };
      global.gameParticipants = {};
    });

    it("should add participant successfully", async () => {
      const response = await request(app)
        .post("/add-participant/TEST123")
        .send({
          userId: "user1",
          displayName: "Player 1",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("added to game");
      expect(global.gameParticipants.TEST123).toBeDefined();
    });

    it("should handle missing user ID", async () => {
      const response = await request(app)
        .post("/add-participant/TEST123")
        .send({
          displayName: "Player 1",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid game or user ID.");
    });

    it("should handle missing display name", async () => {
      const response = await request(app)
        .post("/add-participant/TEST123")
        .send({ userId: "user1" });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("added to game");
      expect(global.gameParticipants.TEST123).toBeDefined();
    });

    it("should handle invalid game ID", async () => {
      const response = await request(app)
        .post("/add-participant/INVALID")
        .send({
          userId: "user1",
          displayName: "Player 1",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid game or user ID.");
    });

    it("should add participant to existing participants list", async () => {
      global.gameParticipants.TEST123 = {
        existingUser: { displayName: "Existing Player" },
      };

      const response = await request(app)
        .post("/add-participant/TEST123")
        .send({
          userId: "user1",
          displayName: "Player 1",
        });

      expect(response.status).toBe(200);
      expect(global.gameParticipants.TEST123.existingUser).toBeDefined();
      expect(global.gameParticipants.TEST123.user1).toBeDefined();
    });
  });

  describe("POST /remove-participant/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {},
      };
      global.gameParticipants = {
        TEST123: {
          user1: { displayName: "Player 1" },
        },
      };
    });

    it("should remove participant successfully", async () => {
      const response = await request(app)
        .post("/remove-participant/TEST123")
        .send({
          userId: "user1",
          displayName: "Player 1",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("removed from game");
    });

    it("should handle already removed participant", async () => {
      const response = await request(app)
        .post("/remove-participant/TEST123")
        .send({
          userId: "user2",
          displayName: "Player 2",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain(
        "was already removed or not found"
      );
    });

    it("should handle missing user ID", async () => {
      global.activeGames = {
        TEST123: {},
      };

      const response = await request(app)
        .post("/remove-participant/TEST123")
        .send({ displayName: "Player 1" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid game or user ID.");
    });

    it("should handle missing game ID", async () => {
      const response = await request(app).post("/remove-participant/").send({
        userId: "user1",
        displayName: "Player 1",
      });

      expect(response.status).toBe(404); // Express default 404
    });

    it("should initialize empty participants object if not exists", async () => {
      delete global.gameParticipants.TEST123;

      const response = await request(app)
        .post("/remove-participant/TEST123")
        .send({
          userId: "user1",
          displayName: "Player 1",
        });

      expect(response.status).toBe(200);
      expect(global.gameParticipants.TEST123).toEqual({});
    });
  });

  describe("GET /question/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          questions: [
            {
              Category: "TEST",
              Value: 200,
              Question: "Test question",
              Answer: "Test answer",
            },
          ],
          lastActivity: Date.now(),
        },
      };
    });

    it("should return question details successfully", async () => {
      const response = await request(app)
        .get("/question/TEST123")
        .query({ category: "TEST", value: 200 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        question: "Test question",
        answer: "Test answer",
        category: "TEST",
        value: 200,
      });
    });

    it("should handle non-existent game", async () => {
      const response = await request(app)
        .get("/question/INVALID")
        .query({ category: "TEST", value: 200 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
    });

    it("should handle non-existent question", async () => {
      const response = await request(app)
        .get("/question/TEST123")
        .query({ category: "INVALID", value: 999 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Question not found for the specified category and value."
      );
    });
  });
});
