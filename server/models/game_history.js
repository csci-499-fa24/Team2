module.exports = (sequelize, DataTypes) => {
    const GameHistory = sequelize.define('game_history', {
        GameID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'GameID' // Primary key for each game record
        },
        ShowNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'ShowNumber' // Show number reference
        },
        Owner: {
            type: DataTypes.TEXT, // Owner is the user ID, can be a long string
            allowNull: false,
            field: 'Owner' // Firebase user ID of the owner
        },
        Points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'Points' // Total points scored in the game
        },
        Winner: {
            type: DataTypes.TEXT, // Winner is also a user ID, can be a long string
            allowNull: false,
            field: 'Winner' // Firebase user ID of the winner
        },
        GameDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'GameDate' // Date the game was played
        }
    }, {
        tableName: 'game_history',
        timestamps: false // Disable automatic timestamps
    });

    return GameHistory;
};