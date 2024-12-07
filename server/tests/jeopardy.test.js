const request = require("supertest");
const express = require("express");
const { Jeopardy } = require("../models");
const jeopardyRouter = require("../controllers/jeopardy");

const app = express();
app.use(express.json());
app.use("/jeopardy", jeopardyRouter);

jest.mock("../models", () => ({
  Jeopardy: {
    findAll: jest.fn(),
  },
}));

describe("Jeopardy Controller", () => {
  describe("GET /jeopardy", () => {
    it("should return all unique show numbers", async () => {
      const mockShowNumbers = [{ show_number: 1001 }, { show_number: 1002 }];
      Jeopardy.findAll.mockResolvedValue(mockShowNumbers);

      const response = await request(app).get("/jeopardy");
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockShowNumbers);
      expect(Jeopardy.findAll).toHaveBeenCalledWith({
        attributes: ["show_number"],
        distinct: true,
        group: ["show_number"],
      });
    });

    it("should return 500 on database error", async () => {
      Jeopardy.findAll.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/jeopardy");
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });

  describe("GET /jeopardy/:show_number", () => {
    it("should return all Jeopardy records for a given show number", async () => {
      const mockJeopardies = [
        { show_number: 1001, question: "Question 1" },
        { show_number: 1001, question: "Question 2" },
      ];
      Jeopardy.findAll.mockResolvedValue(mockJeopardies);

      const response = await request(app).get("/jeopardy/1001");
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockJeopardies);
      expect(Jeopardy.findAll).toHaveBeenCalledWith({
        where: { show_number: "1001" },
      });
    });

    it("should return 500 on database error", async () => {
      Jeopardy.findAll.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/jeopardy/1001");
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });

    it("should return an empty array if no records are found", async () => {
      Jeopardy.findAll.mockResolvedValue([]);

      const response = await request(app).get("/jeopardy/9999");
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
