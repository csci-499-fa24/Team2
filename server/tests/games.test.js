const request = require("supertest");
const express = require("express");
const gamesRouter = require("../controllers/games");
const {
  getRandomShowNumber,
  getJeopardyData,
  validateGame,
  generateGameId,
  endGame,
} = require("../lib/gameUtils");

// Mock the gameUtils functions
jest.mock("../lib/gameUtils");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/", gamesRouter);

// Mock the global activeGames object
global.activeGames = {};
global.gameParticipants = {};
global.io = {
  emit: jest.fn(),
};

describe("Games Controller", () => {
  beforeEach(() => {
    // Clear mocks and reset activeGames before each test
    jest.clearAllMocks();
    global.activeGames = {};
    global.gameParticipants = {};

    // Mock generateGameId to return a consistent value
    generateGameId.mockReturnValue("TEST123");

    // Mock endGame to properly clean up the game
    endGame.mockImplementation((gameId) => {
      delete global.activeGames[gameId];
      delete global.gameParticipants[gameId];
    });

    // Mock getRandomShowNumber to return a valid show number
    getRandomShowNumber.mockResolvedValue("123");

    // Mock validateGame to return true
    validateGame.mockResolvedValue(true);

    // Mock getJeopardyData to return test questions
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
    });

    describe("GET /active-games", () => {
      beforeEach(() => {
        // Setup test game data
        global.activeGames = {
          TEST123: {
            isPrivate: false,
            inProgress: false,
            maxPlayers: 4,
            playerCount: 2,
          },
        };
      });

      it("should return basic game info by default", async () => {
        const response = await request(app).get("/active-games");

        expect(response.status).toBe(200);
        expect(response.body.activeGames).toHaveLength(1);
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
    });

    describe("POST /add-participant/:gameId", () => {
      beforeEach(() => {
        global.activeGames = {
          TEST123: {
            playerCount: 0,
          },
        };
      });

      it("should add a participant successfully", async () => {
        const response = await request(app)
          .post("/add-participant/TEST123")
          .send({
            userId: "user1",
            displayName: "Player 1",
          });

        expect(response.status).toBe(200);
        expect(global.gameParticipants["TEST123"]).toBeDefined();
        expect(response.body.message).toContain("added to game");
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

    it("should mark a game as in progress", async () => {
      const response = await request(app).post("/set-in-progress/TEST123");

      expect(response.status).toBe(200);
      expect(global.activeGames.TEST123.inProgress).toBe(true);
    });

    it("should handle non-existent game", async () => {
      const response = await request(app).post("/set-in-progress/INVALID");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
    });
  });

  describe("POST /remove-participant/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          playerCount: 1,
        },
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
  });
});
