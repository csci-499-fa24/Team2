const { setupSocketServer, rooms } = require('../socketServer');
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("Socket.IO server tests", () => {
    let io, server, clientSocket, serverSocket, currentDisplayName, currentRoomKey;

    beforeAll((done) => {
        // Create HTTP server and set up Socket.IO server
        server = require("http").createServer();
        io = setupSocketServer(server); // Set up the socket server with http server

        io.on("connection", (socket) => {
            serverSocket = socket; // Capture the server-side socket for testing
            currentDisplayName = "";
            currentRoomKey = ""; 
        });

        server.listen(() => {
            done();
        });
    });

    beforeEach((done) => {
        const port = server.address().port;
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket.on("connect", done); // Proceed once client is connected
    });

    afterEach((done) => {
        if (clientSocket) clientSocket.close();
        if (serverSocket) serverSocket.disconnect();  
        done();
    });

    afterAll((done) => {
        io.close();
        clientSocket.close();
        server.close(done);
    });

    test("should set display name and add user to default room", (done) => {
        clientSocket.emit("displayName", "TestUser");

        serverSocket.on("displayName", (displayName) => {
            expect(displayName).toBe("TestUser");
            expect(rooms[""]["TestUser"]).toStrictEqual(0);
            done();
        });
    });

    test("should prompt for a set displayName if given null displayName", (done) => {
        clientSocket.emit("roomKey", "Room1");

        clientSocket.on("promptDisplayName", (message) => {
            expect(message).toBe("Please set your display name before joining a room.");
            expect(rooms["Room1"]).toBeUndefined();
            done();
        });

        setTimeout(() => {
            done(new Error("Test timed out: 'promptDisplayName' event not emitted."));
        }, 3000).unref(); // Set a timeout of 3 seconds
    });

    test("should set room key and move user to specified room", (done) => {
        clientSocket.emit("displayName", "TestUser");
        clientSocket.emit("roomKey", "Room1");

        serverSocket.on("roomKey", (roomKey) => {
            expect(roomKey).toBe("Room1");
            expect(rooms["Room1"]["TestUser"]).toStrictEqual({});
            done();
        });
    });

    // For testing lines 69-80 of "roomKey" event listener
    // To be debugged:

    // test("should remove player from previous room and add them to new room", (done) => {
    //     const previousRoomKey = "prevRoom";
    //     const newRoomKey = "newRoom";
    //     const displayName = "TestUser";

    //     rooms[previousRoomKey] = { [displayName]: { money: 0, ready: false } };

    //     clientSocket.emit("displayName", displayName);
    //     clientSocket.emit("player_joined", { 
    //         roomKey: previousRoomKey, 
    //         displayName: displayName });
    //     clientSocket.emit("roomKey", newRoomKey);

    //     serverSocket.on("roomKey", (roomKey) => {
    //         setTimeout(() => {  
    //             expect(roomKey).toBe("newRoom");
    //             expect(rooms[roomKey][displayName]).toStrictEqual({});
    //             expect(rooms[previousRoomKey][displayName]).toBeUndefined();
    //             done();
    //         }, 100); 
    //     });
    // }, 10000);

    test("should send a custom message to specified room", (done) => {
        clientSocket.emit("customMessage", {
            displayName: "TestUser",
            message: "Hello Room1",
            roomKey: "Room1",
        });

        serverSocket.on("customMessage", (message) => {
            done();
        });
    });

    test("should handle room data request", (done) => {
        clientSocket.emit("getRooms");

        serverSocket.on("getRooms", (roomsData) => {
            expect(roomsData).toBeUndefined(); // Check for default room
            done();
        });
    });

    test("should handle player joining new room", (done) => {
        const roomKey = "NewRoom";
        const playerName = "TestUser";

        clientSocket.emit("player_joined", {roomKey, playerName});
        serverSocket.on("player_joined", ({ roomKey, playerName }) => {
            expect(rooms[roomKey][playerName]).toStrictEqual({ money: 0, ready: false });
            done();
        });
    });

    test("should prevent user from joining full room", (done) => {
        const roomKey = "room1";
        const playerName = "TestUser";

        rooms[roomKey] = {
            "player1": {money: 0, ready: false},
            "player2": {money: 0, ready: false},
            "player3": {money: 0, ready: false},
            "player4": {money: 0, ready: false},
        };

        clientSocket.emit("player_joined", {roomKey, playerName});
        clientSocket.on("roomFull", (message) => {
            expect(message).toBe(`Room ${roomKey} is full. Cannot join.`);
            expect(rooms[roomKey][playerName]).toBeUndefined();
            done();
        });
    });

    test("should handle player leaving room", (done) => {
        const roomKey = "Room1";
        const playerName = "TestUser";
        rooms[roomKey] = { [playerName]: { money: 0, ready: false } };

        clientSocket.emit("displayName", playerName);
        clientSocket.emit("player_left", { roomKey, displayName: playerName });
        serverSocket.on("player_left", ({ roomKey, displayName }) => {
            expect(rooms[roomKey][displayName]).toBeUndefined();
            done();
        });
    });

    test("should toggle player ready status from false to true in room", (done) => {
        const roomKey = "room1";
        const displayName = "TestUser";

        rooms[roomKey] = {
            [displayName]: {money: 0, ready: false}
        };

        clientSocket.emit("player_ready", {roomKey, displayName});
        serverSocket.on("player_ready", ({roomKey, displayName}) => {
            expect(rooms[roomKey][displayName].ready).toBe(true);
            done();
        });
    });

    test("should log error for non-existent player/room for ready status", (done) => {
        const roomKey = "room1";
        const displayName = "nonExistentPlayer";
        const consoleLog = jest.spyOn(console, "log").mockImplementation();

        clientSocket.emit("player_ready", {roomKey, displayName});
        serverSocket.on("player_ready", ({roomKey, displayName}) => {
            expect(consoleLog).toHaveBeenCalledWith(`Player ${displayName} or room ${roomKey} not found`);
            done();
        });
    });

    test("should get players in existing room",(done) => {
        const roomKey = "RoomPlayers";
        const player1 = "TestPlayerInRoom";
        const player2 = "TestPlayerInRoom2";
        const consoleLog = jest.spyOn(console, "log").mockImplementation();

        rooms[roomKey] = {
            player1: {money: 0, ready: false}, 
            player2: {money: 0, ready: false}};

        clientSocket.emit("getPlayersInRoom", {roomKey});
        clientSocket.on("update_players_list", ({players}) => {
            expect(players).toStrictEqual(rooms[roomKey]);
            done();
        });
    });

    test("should log error for getting players in non-existent room",(done) => {
        const roomKey = "NonExistentRoom";;
        const consoleLog = jest.spyOn(console, "log").mockImplementation();

        clientSocket.emit("getPlayersInRoom", {roomKey});
        serverSocket.on("getPlayersInRoom", ({roomKey}) => {
            expect(consoleLog).toHaveBeenCalledWith(`Room ${roomKey} does not exist.`);
            done();
        });
    });

    test("should update money for user in a room", (done) => {
        clientSocket.emit("displayName", "TestUser");
        clientSocket.emit("roomKey", "Room1");
        clientSocket.emit("setMoneyAmount", {
            displayName: "TestUser",
            roomKey: "Room1",
            money: 100,
        });

        serverSocket.on("setMoneyAmount", ({ displayName, roomKey, money }) => {
            expect(displayName).toBe("TestUser");
            expect(roomKey).toBe("Room1");
            expect(money).toBe(100);
            expect(rooms["Room1"]["TestUser"].money).toBe(100);
            done();
        });
    });

    test("should create a room when setting money amount for user if it doesn't exist", (done) => {
        const roomKey = "nonExistentRoom";
        const displayName = "TestUser";
        const money = 100;

        expect(rooms[roomKey]).toBeUndefined();

        clientSocket.emit("setMoneyAmount", { 
            displayName: displayName, 
            roomKey: roomKey,
            money: money 
        });
        
        setTimeout(() => {
            expect(rooms[roomKey]).toBeDefined();
            expect(rooms[roomKey].money).toBe(0); 
            expect(rooms[roomKey].ready).toBe(false);
            expect(rooms[roomKey][displayName]).toBeUndefined(); 
            done();
        }, 10).unref();
    });

    test("should log error for player not in room when setting money amount", (done) => {
        const consoleLog = jest.spyOn(console, "log").mockImplementation();
        const displayName = "TestUser";
        const roomKey = "Room1";
        rooms[roomKey] = {};

        clientSocket.emit("setMoneyAmount", {
            displayName: displayName,
            roomKey: roomKey,
            money: 100,
        });

        setTimeout(() => {
            expect(consoleLog).toHaveBeenCalledWith(
                `Player ${displayName} is not in room ${roomKey}`
            );
            expect(rooms[roomKey][displayName]).toBeUndefined();

            consoleLog.mockRestore(); // Restore console.log
            done();
        }, 50).unref();
    });

    test("should handle user disconnect", (done) => {
        clientSocket.emit("displayName", "TestUser");
        clientSocket.emit("roomKey", "Room1");

        clientSocket.disconnect();

        setTimeout(() => {
            expect(rooms["Room1"]["TestUser"]).toBeUndefined();
            done();
        }, 50).unref(); 
    });
});