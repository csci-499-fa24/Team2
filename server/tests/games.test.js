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
  });

  describe("POST /start-game", () => {
    it("should start a new game successfully", async () => {
      // Mock the required functions
      getRandomShowNumber.mockResolvedValue("123");
      validateGame.mockResolvedValue(true);
      getJeopardyData.mockResolvedValue([
        { Round: "Jeopardy!", Category: "TEST", Value: 200 },
      ]);

      const response = await request(app)
        .post("/start-game")
        .send({ maxPlayers: 4 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Game started",
        gameId: "TEST123",
        maxPlayers: 4,
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
          "/active-games?includePrivate=true&includeInProgress=true&includeMaxPlayers=true&includePlayerCount=true"
        );

        expect(response.status).toBe(200);
        expect(response.body.activeGames[0]).toEqual({
          gameId: "TEST123",
          isPrivate: false,
          inProgress: false,
          maxPlayers: 4,
          playerCount: 2,
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
        expect(global.activeGames["TEST123"].playerCount).toBe(1);
        expect(global.io.emit).toHaveBeenCalledWith("roomsUpdated");
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

  describe("POST /start-gameplay/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          inProgress: false,
          lastActivity: Date.now(),
        },
      };
    });

    it("should mark a game as in progress", async () => {
      const response = await request(app).post("/start-gameplay/TEST123");

      expect(response.status).toBe(200);
      expect(global.activeGames.TEST123.inProgress).toBe(true);
      expect(global.io.emit).toHaveBeenCalledWith("roomsUpdated");
    });

    it("should handle non-existent game", async () => {
      const response = await request(app).post("/start-gameplay/INVALID");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
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
            { Round: "Jeopardy!", Category: "TEST2", Value: 200 },
          ],
          lastActivity: Date.now(),
        },
      };
    });

    it("should return round information", async () => {
      const response = await request(app).get("/round-info/TEST123");

      expect(response.status).toBe(200);
      expect(response.body.round).toBe("Jeopardy!");
      expect(response.body.roundInfo).toHaveLength(2); // Two categories
    });

    it("should handle non-existent game", async () => {
      const response = await request(app).get("/round-info/INVALID");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
    });
  });

  describe("GET /question/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          questions: [
            {
              Round: "Jeopardy!",
              Category: "TEST",
              Value: 200,
              Question: "Test Question",
              Answer: "Test Answer",
            },
          ],
          lastActivity: Date.now(),
        },
      };
    });

    it("should return question information", async () => {
      const response = await request(app).get(
        "/question/TEST123?category=TEST&value=200"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        question: "Test Question",
        answer: "Test Answer",
        category: "TEST",
        value: 200,
      });
    });

    it("should handle question not found", async () => {
      const response = await request(app).get(
        "/question/TEST123?category=INVALID&value=100"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Question not found for the specified category and value."
      );
    });
  });

  describe("POST /next-round/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          round: "Jeopardy!",
          questions: [
            { Round: "Double Jeopardy!", Category: "TEST1", Value: 400 },
            { Round: "Double Jeopardy!", Category: "TEST2", Value: 400 },
          ],
          lastActivity: Date.now(),
        },
      };
    });

    it("should advance from Jeopardy to Double Jeopardy", async () => {
      const response = await request(app).post("/next-round/TEST123");

      expect(response.status).toBe(200);
      expect(response.body.round).toBe("Double Jeopardy!");
    });

    it("should handle game not found", async () => {
      const response = await request(app).post("/next-round/INVALID");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
    });
  });

  describe("POST /end-game/:gameId", () => {
    beforeEach(() => {
      global.activeGames = {
        TEST123: {
          showNumber: "123",
          questions: [],
        },
      };
      global.gameParticipants = {
        TEST123: {
          user1: { displayName: "Player 1" },
        },
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
      expect(global.activeGames.TEST123).toBeUndefined();
      expect(global.gameParticipants.TEST123).toBeUndefined();
      expect(endGame).toHaveBeenCalledWith("TEST123", participantData);
    });

    it("should handle invalid participant data", async () => {
      const response = await request(app)
        .post("/end-game/TEST123")
        .send({ participantData: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid participant data.");
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
      expect(global.activeGames.TEST123.playerCount).toBe(0);
      expect(global.io.emit).toHaveBeenCalledWith("roomsUpdated");
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
