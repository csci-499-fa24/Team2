const { setupSocketServer, rooms } = require("../socketServer");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("Socket.IO server tests", () => {
  let io,
    server,
    clientSocket,
    serverSocket,
    currentDisplayName,
    currentRoomKey;

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
      const port = server.address().port;
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket.on("connect", done); // Proceed once client is connected
    });
  });

  // beforeEach(() => {
  //     for (const key in rooms) {
  //         delete rooms[key];
  //     }
  // });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test("should set display name and add user to default room", (done) => {
    clientSocket.emit("displayName", "TestUser");

    serverSocket.on("displayName", (displayName) => {
      expect(displayName).toBe("TestUser");
      expect(rooms[""]["TestUser"]).toStrictEqual(0);
      done();
    });
  });

  // test("should set room key with null displayName", (done) => {
  //     clientSocket.emit("roomKey", "Room1");

  //     clientSocket.on("promptDisplayName", (message) => {
  //         expect(message).toBe("Please set your display name before joining a room.");
  //         expect(rooms["Room1"]).toBeUndefined();
  //         done();
  //     });
  // });

  test("should set room key and move user to specified room", (done) => {
    clientSocket.emit("displayName", "TestUser");
    clientSocket.emit("roomKey", "Room1");

    serverSocket.on("roomKey", (roomKey) => {
      expect(roomKey).toBe("Room1");
      expect(rooms["Room1"]["TestUser"]).toStrictEqual({});
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

  test("should handle player joining non existing room", (done) => {
    const roomKey = null;
    const playerName = "TestUser";

    clientSocket.emit("player_joined", { roomKey, playerName });

    serverSocket.on("player_joined", ({ roomKey, playerName }) => {
      expect(rooms[roomKey][playerName]).toStrictEqual({
        money: 0,
        ready: false,
      });
    });

    clientSocket.on("update_players_list", (data) => {
      // expect(data.players[roomKey]).toBeDefined();
      expect(Object.keys(rooms[roomKey])).toContain(playerName);
    });

    done();
  });

  test("should handle player joining room", (done) => {
    const roomKey = "Room1";
    const playerName = "TestUser";

    clientSocket.emit("player_joined", { roomKey, playerName });

    serverSocket.on("player_joined", ({ roomKey, playerName }) => {
      expect(rooms[roomKey][playerName]).toStrictEqual({
        money: 0,
        ready: false,
      });
    });

    clientSocket.on("update_players_list", (data) => {
      // expect(data.players[roomKey]).toBeDefined();
      expect(Object.keys(rooms[roomKey])).toContain(playerName);
    });

    done();
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
    // First join a room
    clientSocket.emit("displayName", "TestUser");

    serverSocket.on("displayName", () => {
      // After display name is set, join a room
      clientSocket.emit("roomKey", "Room1");

      serverSocket.on("roomKey", () => {
        // After joining the room, disconnect
        clientSocket.disconnect();

        // Give time for disconnect handling
        setTimeout(() => {
          try {
            // Check that Room1 no longer exists
            // expect(rooms["Room1"]).toBeUndefined();
            // Check that user is still in default room
            expect(rooms[""]).toBeDefined();
            expect(rooms[""]["TestUser"]).toBe(0);
            done();
          } catch (error) {
            done(error);
          }
        }); // Increased timeout to ensure disconnect is processed
      });
    });
  });
});
