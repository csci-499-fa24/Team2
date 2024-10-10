module.exports = (sequelize, DataTypes) => {
    const JeopardyQuestions = sequelize.define('jeopardy_questions', {
      ShowNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'ShowNumber' // Ensure that Sequelize uses the correct column name
      },
      AirDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'AirDate' // Explicitly tell Sequelize the column name
      },
      Round: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'Round' // Explicitly tell Sequelize the column name
      },
      Category: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'Category' // Explicitly tell Sequelize the column name
      },
      Value: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'Value' // Explicitly tell Sequelize the column name
      },
      Question: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Question' // Explicitly tell Sequelize the column name
      },
      Answer: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Answer' // Explicitly tell Sequelize the column name
      }
    }, {
      tableName: 'jeopardy_questions',
      timestamps: false // Disable automatic timestamps
    });
  
    return JeopardyQuestions;
  };