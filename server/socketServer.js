module.exports = function (server) {
    const io = require('socket.io')(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    
    const rooms = {
        "": [], // Default room for users without a room
    };
    
    io.on("connection", (socket) => {
        let currentDisplayName = "";
        let currentRoomKey = "";

        console.log("New connection established:", socket.id);

        socket.on("displayName", (displayName) => {
            currentDisplayName = displayName;
            console.log(`Display name received: ${currentDisplayName}`);

            // Add to the default room if no room key is assigned yet
            if (!currentRoomKey) {
                rooms[""].push(currentDisplayName);
            } else {
                // Add the user to their room if they have one
                if (!rooms[currentRoomKey]) {
                    rooms[currentRoomKey] = [];
                }
                rooms[currentRoomKey].push(currentDisplayName);
            }

            console.log("Updated rooms object after displayName set:", rooms);
        });

        socket.on("roomKey", (roomKey) => {
            console.log(`Room key received: ${roomKey}, Current Display Name: ${currentDisplayName}`);

            // Check if displayName is set; this validation is also done client side, so it shouldn't come to this
            if (!currentDisplayName) {
                console.log("Display name not set. Prompting client to set display name.");
                socket.emit("promptDisplayName", "Please set your display name before joining a room.");
                return;
            }

            // Remove the user from the default room (also a catch-all for when a user rejoins)
            if (rooms[""].includes(currentDisplayName)) {
                rooms[""] = rooms[""].filter((name) => name !== currentDisplayName);
                console.log(`User "${currentDisplayName}" removed from default room.`);
            }

            // Remove the user from any previously assigned room
            if (currentRoomKey) {
                rooms[currentRoomKey] = rooms[currentRoomKey].filter((name) => name !== currentDisplayName);
                // Make the socket leave the previous room
                socket.leave(currentRoomKey);
            }

            // Assign the user to the new room
            currentRoomKey = roomKey;
            if (!rooms[roomKey]) {
                rooms[roomKey] = [];
            }
            rooms[roomKey].push(currentDisplayName);

            // actual joining of room here
            socket.join(roomKey);

            console.log(`User "${currentDisplayName}" joined room "${roomKey}"`);
            console.log("Updated rooms object after roomKey set:", rooms);

            // Confirm the user has joined the room
            socket.emit("confirmReceivedRoom", `You joined room: ${roomKey}`);
        });

        socket.on("customMessage", (message) => {
            console.log(`Custom message from ${message["displayName"]}: ${message["message"]}, ${message["roomKey"]}`);
            // Emit the message to all sockets in the room except the sender (note use io.to().emit() if you want to everyone in room)
            socket.to(message["roomKey"]).emit("receivedCustomMessage", message["message"]);
        });

        socket.on("getRooms", () => {
            console.log(`Rooms data requested by ${currentDisplayName}`);
            socket.emit("receiveRooms", rooms);  // Send rooms object back to the client
        });

        socket.on("disconnect", () => {
            if (currentRoomKey) {
                rooms[currentRoomKey] = rooms[currentRoomKey].filter((name) => name !== currentDisplayName);
                // sockets leaves the room upon disconnection
                socket.leave(currentRoomKey);
            }
            console.log(`User ${currentDisplayName} disconnected from room "${currentRoomKey}"`);
            console.log("Updated rooms object after disconnect:", rooms);
        });
    });
};