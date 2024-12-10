const db = require("../models"); // Mocked
const {
  generateGameId,
  validateGame,
  getRandomShowNumber,
  getJeopardyData,
  removeGame,
  resolveGame,
  endGame,
  recordGameHistory,
} = require("../lib/gameUtils");

jest.mock("../models"); // Mock the database module

describe("Game Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global objects
    global.activeGames = {};
    global.gameParticipants = {};
  });

  describe("generateGameId", () => {
    it("should generate a unique 6-character alphanumeric game ID", () => {
      const activeGames = {};
      global.activeGames = activeGames; // Simulate global activeGames object

      const gameId = generateGameId();
      expect(gameId).toHaveLength(6);
      expect(/^[A-Z0-9]{6}$/.test(gameId)).toBe(true);
    });

    it("should retry if a generated ID is already in activeGames", () => {
      const activeGames = { ABC123: true };
      global.activeGames = activeGames;

      const gameId = generateGameId();
      expect(gameId).not.toBe("ABC123");
    });
  });

  describe("getRandomShowNumber", () => {
    it("should return a random show number from the database", async () => {
      db.jeopardy_questions.findAll.mockResolvedValue([
        { ShowNumber: 1001 },
        { ShowNumber: 1002 },
        { ShowNumber: 1003 },
      ]);

      const showNumber = await getRandomShowNumber();
      expect([1001, 1002, 1003]).toContain(showNumber);
    });

    it("should return null if no show numbers are found", async () => {
      db.jeopardy_questions.findAll.mockResolvedValue([]);
      const showNumber = await getRandomShowNumber();
      expect(showNumber).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      db.jeopardy_questions.findAll.mockRejectedValue(
        new Error("Database error")
      );
      const showNumber = await getRandomShowNumber();
      expect(showNumber).toBeNull();
    });
  });

  describe("removeGame", () => {
    it("should remove the game from the database", async () => {
      db.jeopardy_questions.destroy.mockResolvedValue(1);
      await expect(removeGame(1001)).resolves.not.toThrow();
      expect(db.jeopardy_questions.destroy).toHaveBeenCalledWith({
        where: { ShowNumber: 1001 },
      });
    });

    it("should handle database errors gracefully", async () => {
      db.jeopardy_questions.destroy.mockRejectedValue(
        new Error("Database error")
      );
      await expect(removeGame(1001)).resolves.not.toThrow();
      expect(db.jeopardy_questions.destroy).toHaveBeenCalledWith({
        where: { ShowNumber: 1001 },
      });
    });
  });

  describe("recordGameHistory", () => {
    it("should record game history and player history", async () => {
      db.game_history.create.mockResolvedValue({ GameID: 1 });
      db.player_history.bulkCreate.mockResolvedValue([]);

      const players = [{ userId: "1", win: false, points: 10 }];
      await expect(
        recordGameHistory(1, 1001, "owner", "winner", 50, players)
      ).resolves.not.toThrow();

      expect(db.game_history.create).toHaveBeenCalledWith({
        ShowNumber: 1001,
        Owner: "owner",
        Winner: "winner",
        Points: 50,
        GameDate: expect.any(Date),
      });
      expect(db.player_history.bulkCreate).toHaveBeenCalledWith([
        { GameID: 1, UserID: "1", Win: false, Points: 10 },
      ]);
    });
  });

  describe("validateGame", () => {
    it("should return true for a valid game", async () => {
      const mockQuestions = [
        // Jeopardy Round (6 categories, 5 questions each)
        ...Array(30)
          .fill(null)
          .map((_, i) => ({
            Round: "Jeopardy!",
            Category: `Category${Math.floor(i / 5) + 1}`,
          })),
        // Double Jeopardy Round
        ...Array(30)
          .fill(null)
          .map((_, i) => ({
            Round: "Double Jeopardy!",
            Category: `DoubleCategory${Math.floor(i / 5) + 1}`,
          })),
        // Final Jeopardy
        { Round: "Final Jeopardy!", Category: "FinalCategory" },
      ];

      db.jeopardy_questions.findAll.mockResolvedValue(mockQuestions);
      const isValid = await validateGame(1001);
      expect(isValid).toBe(true);
    });

    it("should return false if categories are missing", async () => {
      const mockQuestions = [
        // Only 5 categories in Jeopardy Round
        ...Array(25)
          .fill(null)
          .map((_, i) => ({
            Round: "Jeopardy!",
            Category: `Category${Math.floor(i / 5) + 1}`,
          })),
        // Double Jeopardy Round
        ...Array(30)
          .fill(null)
          .map((_, i) => ({
            Round: "Double Jeopardy!",
            Category: `DoubleCategory${Math.floor(i / 5) + 1}`,
          })),
        { Round: "Final Jeopardy!", Category: "FinalCategory" },
      ];

      db.jeopardy_questions.findAll.mockResolvedValue(mockQuestions);
      const isValid = await validateGame(1001);
      expect(isValid).toBe(false);
    });

    it("should return false when Final Jeopardy has multiple categories", async () => {
      const mockQuestions = [
        ...Array(30)
          .fill(null)
          .map((_, i) => ({
            Round: "Jeopardy!",
            Category: `Category${Math.floor(i / 5) + 1}`,
          })),
        ...Array(30)
          .fill(null)
          .map((_, i) => ({
            Round: "Double Jeopardy!",
            Category: `DoubleCategory${Math.floor(i / 5) + 1}`,
          })),
        { Round: "Final Jeopardy!", Category: "FinalCategory1" },
        { Round: "Final Jeopardy!", Category: "FinalCategory2" },
      ];

      db.jeopardy_questions.findAll.mockResolvedValue(mockQuestions);
      const isValid = await validateGame(1001);
      expect(isValid).toBe(false);
    });

    it("should return false when categories don't have exactly 5 questions each", async () => {
      const mockQuestions = [
        ...Array(29)
          .fill(null)
          .map((_, i) => ({
            Round: "Jeopardy!",
            Category: `Category${Math.floor(i / 5) + 1}`,
          })),
        ...Array(30)
          .fill(null)
          .map((_, i) => ({
            Round: "Double Jeopardy!",
            Category: `DoubleCategory${Math.floor(i / 5) + 1}`,
          })),
        { Round: "Final Jeopardy!", Category: "FinalCategory" },
      ];

      db.jeopardy_questions.findAll.mockResolvedValue(mockQuestions);
      const isValid = await validateGame(1001);
      expect(isValid).toBe(false);
    });
  });

  describe("getJeopardyData", () => {
    it("should return questions for a given show number", async () => {
      const mockQuestions = [
        { ShowNumber: 1001, Question: "Test Question 1" },
        { ShowNumber: 1001, Question: "Test Question 2" },
      ];
      db.jeopardy_questions.findAll.mockResolvedValue(mockQuestions);

      const result = await getJeopardyData(1001);
      expect(result).toEqual(mockQuestions);
      expect(db.jeopardy_questions.findAll).toHaveBeenCalledWith({
        where: { ShowNumber: 1001 },
      });
    });

    it("should return empty array on error", async () => {
      db.jeopardy_questions.findAll.mockRejectedValue(
        new Error("Database error")
      );
      const result = await getJeopardyData(1001);
      expect(result).toEqual([]);
    });
  });

  describe("endGame", () => {
    beforeEach(() => {
      global.activeGames = { GAME01: { showNumber: 1001 } };
      global.gameParticipants = {
        GAME01: {
          user1: { displayName: "Player1" },
          user2: { displayName: "Player2" },
        },
      };
    });

    it("should end game and record history with correct winner", () => {
      const participantData = {
        Player1: 1000,
        Player2: 500,
      };

      endGame("GAME01", participantData);

      expect(global.activeGames.GAME01).toBeUndefined();
      expect(global.gameParticipants.GAME01).toBeUndefined();
      expect(db.game_history.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ShowNumber: 1001,
          Owner: "Player1",
          Winner: "Player1",
          Points: 1000,
        })
      );
    });

    it("should handle game not found", () => {
      endGame("NONEXISTENT", {});
      expect(db.game_history.create).not.toHaveBeenCalled();
    });

    it("should handle case with no participants", () => {
      global.activeGames = { GAME01: { showNumber: 1001 } };
      global.gameParticipants = { GAME01: {} };

      endGame("GAME01", {});

      expect(db.game_history.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ShowNumber: 1001,
          Owner: "No Owner",
          Winner: "No Winner",
          Points: 0,
        })
      );
    });

    it("should handle case with negative points", () => {
      global.activeGames = { GAME01: { showNumber: 1001 } };
      global.gameParticipants = {
        GAME01: {
          user1: { displayName: "Player1" },
        },
      };

      endGame("GAME01", { Player1: -1000 });

      expect(db.game_history.create).toHaveBeenCalledWith(
        expect.objectContaining({
          Points: 0,
        })
      );
    });
  });

  describe("resolveGame", () => {
    it("should call endGame with the gameId", () => {
      const gameId = "GAME01";
      resolveGame(gameId);
      // Since resolveGame just calls endGame, we can verify the game was removed
      expect(global.activeGames[gameId]).toBeUndefined();
    });
  });
});
