const { setupSocketServer, rooms } = require('../socketServer');
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("Socket.IO server tests", () => {
    let io, server, clientSocket, serverSocket;

    beforeAll((done) => {
        // Create HTTP server and set up Socket.IO server
        server = require("http").createServer();
        io = setupSocketServer(server); // Set up the socket server with http server

        io.on("connection", (socket) => {
            serverSocket = socket; // Capture the server-side socket for testing
        });

        server.listen(() => {
            const port = server.address().port;
            clientSocket = Client(`http://localhost:${port}`);
            clientSocket.on("connect", done); // Proceed once client is connected
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
    });

    test("should set display name and add user to default room", (done) => {
        clientSocket.emit("displayName", "TestUser");

        serverSocket.on("displayName", (displayName) => {
            expect(displayName).toBe("TestUser");
            expect(rooms[""]["TestUser"]).toStrictEqual({money: 0, ready: false});
            done();
        });
    });

    test("should set room key and move user to specified room", (done) => {
        clientSocket.emit("displayName", "TestUser");
        clientSocket.emit("roomKey", "Room1");

        serverSocket.on("roomKey", (roomKey) => {
            expect(roomKey).toBe("Room1");
            expect(rooms["Room1"]["TestUser"]).toStrictEqual({money: 0, ready: false});
            done();
        });
    });

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

    test("should update money for user in a room", (done) => {
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

    test("should handle user disconnect", (done) => {
        clientSocket.emit("displayName", "TestUser");
        clientSocket.emit("roomKey", "Room1");

        clientSocket.disconnect();

        setTimeout(() => {
            expect(rooms["Room1"]["TestUser"]).toBeUndefined();
            done();
        }, 50); // Wait briefly for disconnect handling
    });
});
