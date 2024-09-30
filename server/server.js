require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const db = require('./models');
const cors = require('cors')
const app = express();
const routes = require("./controllers");

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 8080;

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

db.sequelize.sync().then((req) => {
    app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    });
});

app.use("/api", routes);