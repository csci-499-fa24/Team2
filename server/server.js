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
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      isServerRunning = true;
  });
}
const server = http.createServer(app);

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

  const startSocketServer = async () => {
    // if (isServerRunning) {
    //   console.log('Server is already running.');
    //   return; 
    // }

    let closeSockets; 
  
    try {
      await db.sequelize.sync();
      closeSockets = initializeSockets(server);
    } catch (err) {
      console.error('Error starting the server:', err);
    }
  
    return closeSockets;
  };

if (require.main === module) {
  startSocketServer();
}

app.use("/api", routes);
module.exports = app;