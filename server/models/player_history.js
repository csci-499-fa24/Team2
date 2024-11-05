module.exports = (sequelize, DataTypes) => {
    const PlayerHistory = sequelize.define('player_history', {
        GameID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'game_history', // Foreign key to game_history table
                key: 'GameID'
            },
            field: 'GameID'
        },
        UserID: {
            type: DataTypes.TEXT, // Firebase user ID of the player
            allowNull: false,
            field: 'UserID'
        },
        Win: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'Win' // Whether this player won the game
        },
        Points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'Points' // Points scored by this player
        }
    }, {
        tableName: 'player_history',
        timestamps: false // Disable automatic timestamps
    });

    PlayerHistory.associate = models => {
        // Define association with game_history
        PlayerHistory.belongsTo(models.game_history, { foreignKey: 'GameID', as: 'GameHistory' });
    };


    return PlayerHistory;
};