const request = require("supertest");
const express = require("express");
const historyRouter = require("../controllers/history");
const { getPlayerHistory } = require("../lib/playerHistory");
const { recordGameHistory } = require("../lib/gameUtils");

// Mock the playerHistory and gameUtils functions
jest.mock("../lib/playerHistory");
jest.mock("../lib/gameUtils");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/", historyRouter);

describe("History Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /player_history/:playerId", () => {
    it("should return player history successfully", async () => {
      const mockHistory = [
        {
          game_id: 1,
          show_number: "123",
          points: 1000,
          result: "win",
          date: "2024-01-01",
        },
      ];

      getPlayerHistory.mockResolvedValue(mockHistory);

      const response = await request(app).get("/player_history/user123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        playerId: "user123",
        gameHistory: mockHistory,
      });
      expect(getPlayerHistory).toHaveBeenCalledWith("user123");
    });

    it("should handle errors when fetching player history", async () => {
      getPlayerHistory.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/player_history/user123");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Database error",
      });
    });
  });

  describe("POST /record_game", () => {
    it("should record game history successfully", async () => {
      const gameData = {
        gameId: "GAME123",
        showNumber: "456",
        owner: "user1",
        winner: "user2",
        points: 1500,
        players: ["user1", "user2"],
      };

      recordGameHistory.mockResolvedValue();

      const response = await request(app).post("/record_game").send(gameData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Game recorded successfully",
      });
      expect(recordGameHistory).toHaveBeenCalledWith(
        gameData.gameId,
        gameData.showNumber,
        gameData.owner,
        gameData.winner,
        gameData.points,
        gameData.players
      );
    });

    it("should handle missing required fields", async () => {
      const gameData = {
        gameId: "GAME123",
        // Missing required fields
      };

      const response = await request(app).post("/record_game").send(gameData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Missing required fields or invalid data",
      });
      expect(recordGameHistory).not.toHaveBeenCalled();
    });

    it("should handle errors when recording game history", async () => {
      const gameData = {
        gameId: "GAME123",
        showNumber: "456",
        owner: "user1",
        winner: "user2",
        points: 1500,
        players: ["user1", "user2"],
      };

      recordGameHistory.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/record_game").send(gameData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "An error occurred while record the game",
      });
    });

    it("should validate players array", async () => {
      const gameData = {
        gameId: "GAME123",
        showNumber: "456",
        owner: "user1",
        winner: "user2",
        points: 1500,
        players: "not-an-array", // Invalid players data
      };

      const response = await request(app).post("/record_game").send(gameData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Missing required fields or invalid data",
      });
      expect(recordGameHistory).not.toHaveBeenCalled();
    });
  });
});
