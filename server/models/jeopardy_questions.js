module.exports = (sequelize, DataTypes) => {
  const JeopardyQuestions = sequelize.define('jeopardy_questions', {
    ShowNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Set ShowNumber as the primary key
    },
    AirDate: {
      type: DataTypes.DATE,
      allowNull: true, // Assuming it can be null
    },
    Round: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    tableName: 'jeopardy_questions',
    timestamps: false,
    // Disable the default 'id' field
    underscored: true,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false
  });

  return JeopardyQuestions;
};