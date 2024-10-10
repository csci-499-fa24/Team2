require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const db = require('./models');
const cors = require('cors')
const app = express();
const routes = require("./controllers");
const initializeSockets = require('./socketServer');
const http = require('http');

app.use(cors({origin: "*"}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);

if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      isServerRunning = true;
  });
  initializeSockets(server);
}

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
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

db.sequelize.sync()

app.use("/api", routes);
module.exports = app;