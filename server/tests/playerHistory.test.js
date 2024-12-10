const { getPlayerHistory } = require("../lib/playerHistory");
const db = require("../models");

jest.mock("../models");

describe("Player History Functions", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    jest.resetModules();
  });

  describe("getPlayerHistory", () => {
    it("should return formatted player history", async () => {
      const mockPlayerGames = [
        {
          GameID: 1,
          Points: 1000,
          Win: true,
          GameHistory: {
            ShowNumber: "1234",
            GameDate: "2024-03-20",
          },
        },
        {
          GameID: 2,
          Points: 500,
          Win: false,
          GameHistory: {
            ShowNumber: "5678",
            GameDate: "2024-03-21",
          },
        },
      ];

      db.player_history.findAll.mockResolvedValue(mockPlayerGames);

      const result = await getPlayerHistory("user123");

      expect(db.player_history.findAll).toHaveBeenCalledWith({
        where: { UserID: "user123" },
        include: [
          {
            model: db.game_history,
            as: "GameHistory",
            attributes: ["ShowNumber", "GameDate"],
            required: true,
          },
        ],
      });

      expect(result).toEqual([
        {
          game_id: 1,
          show_number: "1234",
          points: 1000,
          result: "win",
          date: "2024-03-20",
        },
        {
          game_id: 2,
          show_number: "5678",
          points: 500,
          result: "lost",
          date: "2024-03-21",
        },
      ]);
    });

    it("should handle empty player history", async () => {
      db.player_history.findAll.mockResolvedValue([]);

      const result = await getPlayerHistory("user123");

      expect(result).toEqual([]);
    });

    it("should throw error when database query fails", async () => {
      db.player_history.findAll.mockRejectedValue(new Error("Database error"));

      await expect(getPlayerHistory("user123")).rejects.toThrow(
        "Failed to retrieve player history"
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching player history:",
        expect.any(Error)
      );
    });

    it("should handle null values in game history", async () => {
      const mockPlayerGames = [
        {
          GameID: 1,
          Points: null,
          Win: true,
          GameHistory: {
            ShowNumber: null,
            GameDate: null,
          },
        },
      ];

      db.player_history.findAll.mockResolvedValue(mockPlayerGames);

      const result = await getPlayerHistory("user123");

      expect(result).toEqual([
        {
          game_id: 1,
          show_number: null,
          points: null,
          result: "win",
          date: null,
        },
      ]);
    });
  });
});
