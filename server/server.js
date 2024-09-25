const express = require("express");
const { Sequelize } = require('sequelize');
const db = require('./models');
const cors = require('cors')
const app = express();
require('dotenv').config();
const routes = require("./controllers");
const http = require('http');
const socketIo = require('socket.io');

app.use(cors());
const port = process.env.PORT || 80;
const server = http.createServer(app);
// Database connection
const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
    host: 'localhost',
    dialect: 'mysql'
});

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

db.sequelize.sync().then((req) => {
    server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    });
});

app.use("/api", routes);

const io = socketIo(server, {
  cors: {
    origin: "https://jeopardywithfriends-frontend.onrender.com",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('roomkey', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('initHandshake', (room) => {
    console.log(`Server handshake initiated for room ${room}`);
    socket.emit("serverHandshake", true);
  });

  socket.on('receivedHandshake', (room) => {
    console.log(`Handshake received and confirmed for room ${room}`);
    socket.emit("confirmHandshake", true);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});