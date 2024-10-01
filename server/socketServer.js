module.exports = function (server) {
    const io = require('socket.io')(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    let playerRoom = "";
    io.on('connection', (socket) => {
        console.log('New client connected', socket.id);

        socket.on('roomKey', (room) => {
            playerRoom = room;
            socket.join(playerRoom);
            console.log(`Socket ${socket.id} joined room: "${playerRoom}"`);
            socket.emit("confirmReceivedRoom", `Your request for room: "${playerRoom}" has been received`);
            socket.to(playerRoom).emit("newPlayerJoined", `A new player has joined: "${playerRoom}"`);
        });

        socket.on("customMessage", (msg) => {
            console.log(`The message "${msg}" has been sent to room: "${playerRoom}"`);
            socket.emit("confirmReceivedRoom", `Your message: "${msg}" for room "${playerRoom}" has been received.`);
            socket.to(playerRoom).emit("receivedCustomMessage", `Received custom message from someone in your room: "${msg}"`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });
};