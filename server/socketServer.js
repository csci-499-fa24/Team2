const { Server } = require('socket.io');

let io;
const rooms = {
    "": {}, // Default room for users without a room, stores players and their money
};

function setupSocketServer(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        }
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

            console.log(`User "${currentDisplayName}" added to the default room with 0 balance.`);
            console.log("Updated rooms object after displayName set:", rooms);
        });

        // Event listener for setting the roomKey
        socket.on("roomKey", (roomKey) => {
            console.log(`Room key received: ${roomKey}, Current Display Name: ${currentDisplayName}`);

            if (!currentDisplayName) {
                console.log("Display name not set. Prompting client to set display name.");
                socket.emit("promptDisplayName", "Please set your display name before joining a room.");
                return;
            }
            
            /* 
            Originally there was a block of code here that removed user from default room
            It's actually easier to keep a duplicate of everyone in the default room to refer back to
            */

            // Check if the player is in another room and remove them from that room
            if (currentRoomKey && currentRoomKey !== roomKey && rooms[currentRoomKey]) {
                delete rooms[currentRoomKey][currentDisplayName]; // Remove from the previous room
                socket.leave(currentRoomKey); // Leave the previous room
                console.log(`User "${currentDisplayName}" removed from room "${currentRoomKey}".`);
            }

            // Update the current room key to the new room
            currentRoomKey = roomKey;

            // Add the player to the new room
            if (!rooms[roomKey]) {
                rooms[roomKey] = {}; // Create the room if it doesn't exist
            }
            rooms[roomKey][currentDisplayName] = 0; // Default starting money in the new room
            socket.join(roomKey); // Join the new room

            console.log(`User "${currentDisplayName}" joined room "${roomKey}"`);
            console.log("Updated rooms object after roomKey set:", rooms);

            // Confirm the user has joined the room
            socket.emit("confirmReceivedRoom", `You joined room: ${roomKey}`);
        });

        // Event listener for custom messages
        socket.on("customMessage", (message) => {
            console.log(`Custom message from ${message["displayName"]}: ${message["message"]}, ${message["roomKey"]}`);
            socket.to(message["roomKey"]).emit("receivedCustomMessage", message["message"]);
        });

        // Event listener for requesting room data
        socket.on("getRooms", () => {
            socket.emit("receiveRooms", rooms);  // Send rooms object back to the client
        });

        // Event listener for setting money amounts
        socket.on("setMoneyAmount", ({ displayName, roomKey, money }) => {
            console.log(`Money update received: ${displayName} in room ${roomKey} now has ${money}`);
        
            // Ensure the displayName and roomKey are valid
            if (displayName && roomKey) {
                if (!rooms[roomKey]) {
                    rooms[roomKey] = {}; // Create the room if it doesn't exist
                }
        
                if (rooms[roomKey][displayName] !== undefined) {
                    rooms[roomKey][displayName] = money; // Update the player's money
                    console.log(`Updated money for ${displayName} in room ${roomKey}: ${money}`);
                } else {
                    console.log(`Player ${displayName} is not in room ${roomKey}`);
                }
            }
        });
        
        // Event listener for handling disconnects
        socket.on("disconnect", () => {
            // Remove the user from their current room when they disconnect
            if (currentRoomKey && rooms[currentRoomKey]) {
                delete rooms[currentRoomKey][currentDisplayName]; // Remove player from the room object
                socket.leave(currentRoomKey);
                console.log(`User ${currentDisplayName} disconnected and removed from room "${currentRoomKey}".`);
            }
            console.log("Updated rooms object after disconnect:", rooms);
        });
    });

    return io;
}

module.exports = { setupSocketServer, io, rooms };