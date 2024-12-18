const { Server } = require("socket.io");
const { resolveGame} = require("./lib/gameUtils")
let io;
const rooms = {
  "": { money: 0, ready: false }, // Default room for users without a room, stores players and their money
};

function setupSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    let currentDisplayName = "";
    let currentRoomKey = ""; // Initially, the user is in the default room

    console.log("New connection established:", socket.id);

    // Event listener for setting the display name
    socket.on("displayName", (displayName) => {
      currentDisplayName = displayName;
      console.log(`Display name received: ${currentDisplayName}`);

      // Add player to the default room with a starting balance of 0
      rooms[""][currentDisplayName] = 0; // Default starting money in the default room
      currentRoomKey = ""; // By default, user is in the default room

      console.log(
        `User "${currentDisplayName}" added to the default room with 0 balance.`
      );
      console.log("Updated rooms object after displayName set:", rooms);
    });

    // Event listener for setting the roomKey
    socket.on("roomKey", (roomKey) => {
      console.log(
        `Room key received: ${roomKey}, Current Display Name: ${currentDisplayName}`
      );

      if (!currentDisplayName) {
        console.log(
          "Display name not set. Prompting client to set display name."
        );
        socket.emit(
          "promptDisplayName",
          "Please set your display name before joining a room."
        );
        return;
      }

      /* 
        Originally there was a block of code here that removed user from default room
        It's actually easier to keep a duplicate of everyone in the default room to refer back to
        */

      // Check if the player is in another room and remove them from that room
      if (
        currentRoomKey &&
        currentRoomKey !== roomKey &&
        rooms[currentRoomKey]
      ) {
        delete rooms[currentRoomKey][currentDisplayName]; // Remove from the previous room
        socket.leave(currentRoomKey); // Leave the previous room
        console.log(
          `User "${currentDisplayName}" removed from room "${currentRoomKey}".`
        );
      }

      // Update the current room key to the new room
      currentRoomKey = roomKey;

      // Add the player to the new room
      if (!rooms[roomKey]) {
        rooms[roomKey] = {}; // Create the room if it doesn't exist
      }
      rooms[roomKey][currentDisplayName] = {}; // Default money/ready status
      socket.join(roomKey); // Join the new room

      console.log(`User "${currentDisplayName}" joined room "${roomKey}"`);
      console.log("Updated rooms object after roomKey set:", rooms);

      // Confirm the user has joined the room
      socket.emit("playersInRoom", Object.keys(rooms[roomKey])); // Send the list of players in the room
      socket.emit("confirmReceivedRoom", `You joined room: ${roomKey}`);
    });

    // Event listener for custom messages
    socket.on("customMessage", (message) => {
      console.log(
        `Custom message from ${message["displayName"]}: ${message["message"]}, ${message["roomKey"]}`
      );
      socket
        .to(message["roomKey"])
        .emit("receivedCustomMessage", message["message"]);
    });

    // Event listener for requesting room data
    socket.on("getRooms", () => {
      socket.emit("receiveRooms", rooms); // Send rooms object back to the client
    });

    // Event listener for player joining room
    socket.on("player_joined", ({ roomKey, playerName }) => {
      console.log("Player joined room called in server:", roomKey, playerName);
      if (!rooms[roomKey]) {
        rooms[roomKey] = {};
      }

      rooms[roomKey][playerName] = { money: 0, ready: false }; // Default money/ready status
      io.to(roomKey).emit("update_players_list", { players: rooms[roomKey] });
    });

    // Server-side custom leaveRoom event
    socket.on("player_left", ({ roomKey, displayName }) => {
      if (rooms[roomKey] && rooms[roomKey][displayName]) {
        delete rooms[roomKey][displayName];
        socket.leave(roomKey);
        console.log(
          `User ${displayName} left room "${roomKey}" via manual leave event.`
        );

        // Notify other users in the room
        socket.to(roomKey).emit("userLeft", displayName);
      }
    });

    // Event listener for toggling player ready status in room
    socket.on("player_ready", ({ roomKey, displayName }) => {
      console.log(
        `Player ${displayName} ready status toggled in room ${roomKey}`
      );
      if (rooms[roomKey] && rooms[roomKey][displayName]) {
        const player = rooms[roomKey][displayName];
        player.ready = !player.ready;
        console.log(
          `Player ${displayName} ready status toggled to ${player.ready}`
        );

        io.to(roomKey).emit("update_players_list", { players: rooms[roomKey] });
      } else {
        console.log(`Player ${displayName} or room ${roomKey} not found`);
      }
    });

    // Event listener for fetching players in a room
    socket.on("getPlayersInRoom", ({ roomKey }) => {
      //console.log("Request to server for players list in room:", roomKey);
      if (rooms[roomKey]) {
        socket.emit("update_players_list", { players: rooms[roomKey] });
      } else {
        console.log(`Room ${roomKey} does not exist.`);
      }
    });

    // Event listener for setting money amounts
    socket.on("setMoneyAmount", ({ displayName, roomKey, money }) => {
      console.log(
        `Money update received: ${displayName} in room ${roomKey} now has ${money}`
      );

      // Ensure the displayName and roomKey are valid
      if (displayName && roomKey) {
        if (!rooms[roomKey]) {
          rooms[roomKey] = { money: 0, ready: false }; // Create the room if it doesn't exist
        }

        if (rooms[roomKey][displayName] !== undefined) {
          rooms[roomKey][displayName].money = money; // Update the player's money
          console.log(
            `Updated money for ${displayName} in room ${roomKey}: ${money}`
          );
        } else {
          console.log(`Player ${displayName} is not in room ${roomKey}`);
        }
      }
    });

    socket.on("roomCreated", () => {
      // Broadcast updated rooms to all connected clients
      io.emit("updateRooms", rooms);
    });
    
    // Event listener for handling disconnects
    socket.on("disconnect", () => {
      // Remove the user from their current room when they disconnect
      if (currentRoomKey && rooms[currentRoomKey]) {
        delete rooms[currentRoomKey][currentDisplayName]; // Remove player from the room object
        socket.leave(currentRoomKey);
        console.log(
          `User ${currentDisplayName} disconnected and removed from room "${currentRoomKey}".`
        );
        if (Object.keys(rooms[currentRoomKey]).length === 0) {
          console.log(`Room "${currentRoomKey}" is empty. Resolving game.`);
          resolveGame(currentRoomKey);
          
        } else {
          console.log("The function did not trigger.")
        }
        io.emit("updateRooms", rooms);
      }
      console.log("Updated rooms object after disconnect:", rooms);
    });
  });

  return io;
}

module.exports = { setupSocketServer, io, rooms };