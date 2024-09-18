'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jeopardy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Jeopardy.init({
    name: DataTypes.STRING,
    subject: DataTypes.STRING,
    creator: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Jeopardy',
  });
  return Jeopardy;
};