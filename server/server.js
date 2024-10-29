require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const db = require('./models');
const app = express();
const initializeSockets = require('./socketServer');
const routes = require('./controllers');


app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;
const server = http.createServer(app);

app.use("/api", routes);

global.activeGames = {}; // Define activeGames as a global variable

// Database connection and server start
if (process.env.NODE_ENV !== 'test') {
  db.sequelize.sync().then(() => {
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    initializeSockets.setupSocketServer(server);
  });
} else {
  console.log('Test environment: Server will not start.');
}

module.exports = { app, server };
