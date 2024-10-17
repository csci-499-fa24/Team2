require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const db = require('./models');
const app = express();
const initializeSockets = require('./socketServer');
const gameRoutes = require('./controllers/games');

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;
const server = http.createServer(app);

// Use game routes
app.use("/api", gameRoutes);

// Database connection and server start
if (process.env.NODE_ENV !== 'test') {
  db.sequelize.sync().then(() => {
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    initializeSockets(server);
  });
} else {
  console.log('Test environment: Server will not start.');
}

module.exports = { app, server };
