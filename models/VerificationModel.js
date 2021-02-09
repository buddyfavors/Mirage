const { DataTypes, Model } = require('sequelize');

module.exports = class VerificationModel extends Model {
    static init(sequelize){
        return super.init({
            UserId: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            GuildId: {
                type: DataTypes.STRING,
            },
            Verifier: {
                type: DataTypes.STRING,
            },
            TimeStamp: {
                type: DataTypes.DATE,
            }
        }, {
            tableName: "tblVerifications",
            sequelize
        })
    }
}