const { DataTypes, Model} = require('sequelize');

module.exports = class UserModel extends Model {
    static init(sequelize){
        return super.init({
            ID: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            UserId: {
                type: DataTypes.STRING,
            },
            GuildId: {
                type: DataTypes.STRING,
            },
            Credits: {
                type: DataTypes.INTEGER,
            },
            BratPoints: {
                type: DataTypes.INTEGER,
            },
            Birthday: {
                type: DataTypes.STRING,
            },
            BirthdayAnnounce: {
                type: DataTypes.STRING,
            },
            TasksGiven: {
                type: DataTypes.INTEGER,
            },
            TasksTaken: {
                type: DataTypes.INTEGER,
            }
        }, {
            tableName: "tblUserData",
            sequelize
        });
    }
}