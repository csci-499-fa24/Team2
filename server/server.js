const express = require("express");
const { Sequelize } = require('sequelize');
const db = require('./models');
const cors = require('cors')
const app = express();
require('dotenv').config();
const routes = require("./controllers");


app.use(cors());
const port = process.env.PORT || 8080;

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
    app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    });
});

app.use("/api", routes);