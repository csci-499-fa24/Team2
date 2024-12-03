const db = require('../models'); // Mocked
const {
    generateGameId,
    validateGame,
    getRandomShowNumber,
    getJeopardyData,
    removeGame,
    resolveGame,
    endGame,
    recordGameHistory
} = require('../lib/gameUtils'); 

jest.mock('../models'); // Mock the database module

describe('Game Functions', () => {
    describe('generateGameId', () => {
        it('should generate a unique 6-character alphanumeric game ID', () => {
            const activeGames = {};
            global.activeGames = activeGames; // Simulate global activeGames object

            const gameId = generateGameId();
            expect(gameId).toHaveLength(6);
            expect(/^[A-Z0-9]{6}$/.test(gameId)).toBe(true);
        });

        it('should retry if a generated ID is already in activeGames', () => {
            const activeGames = { 'ABC123': true };
            global.activeGames = activeGames;

            const gameId = generateGameId();
            expect(gameId).not.toBe('ABC123');
        });
    });

    describe('getRandomShowNumber', () => {
        it('should return a random show number from the database', async () => {
            db.jeopardy_questions.findAll.mockResolvedValue([
                { ShowNumber: 1001 },
                { ShowNumber: 1002 },
                { ShowNumber: 1003 }
            ]);

            const showNumber = await getRandomShowNumber();
            expect([1001, 1002, 1003]).toContain(showNumber);
        });

        it('should return null if no show numbers are found', async () => {
            db.jeopardy_questions.findAll.mockResolvedValue([]);
            const showNumber = await getRandomShowNumber();
            expect(showNumber).toBeNull();
        });
    });

    describe('removeGame', () => {
        it('should remove the game from the database', async () => {
            db.jeopardy_questions.destroy.mockResolvedValue(1);
            await expect(removeGame(1001)).resolves.not.toThrow();
            expect(db.jeopardy_questions.destroy).toHaveBeenCalledWith({ where: { ShowNumber: 1001 } });
        });
    });

    describe('recordGameHistory', () => {
        it('should record game history and player history', async () => {
            db.game_history.create.mockResolvedValue({ GameID: 1 });
            db.player_history.bulkCreate.mockResolvedValue([]);

            const players = [{ userId: '1', win: false, points: 10 }];
            await expect(recordGameHistory(1, 1001, 'owner', 'winner', 50, players)).resolves.not.toThrow();

            expect(db.game_history.create).toHaveBeenCalledWith({
                ShowNumber: 1001,
                Owner: 'owner',
                Winner: 'winner',
                Points: 50,
                GameDate: expect.any(Date)
            });
            expect(db.player_history.bulkCreate).toHaveBeenCalledWith([
                { GameID: 1, UserID: '1', Win: false, Points: 10 }
            ]);
        });
    });
});
