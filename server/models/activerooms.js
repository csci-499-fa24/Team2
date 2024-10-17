'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActiveRooms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ActiveRooms.init({
    RoomID: DataTypes.STRING,
    PlayerAmount: DataTypes.INTEGER,
    show_number: DataTypes.INTEGER,
    owner: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ActiveRooms',
  });
  return ActiveRooms;
};