module.exports = {
    "development": {
      "username": "root",
      "password": ";{:\@nmv}NFslH-E",
      "database": "jeopardy",
      "host": "127.0.0.1",
      "port": 3306,
      "dialect": "mysql"
  },
  "test": {
    "username": "root",
      "password": "",
      "database": "jeopardy",
      "host": "127.0.0.1",
      "port": 3306,
      "dialect": "mysql"
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": "mysql"
  }
}