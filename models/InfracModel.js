const { DataTypes, Model } = require('sequelize');

module.exports = class InfracModel extends Model {
    static init(sequelize){
        return super.init({
            InfracID: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            UserId: {
                type: DataTypes.STRING,
            },
            GuildId: {
                type: DataTypes.STRING,
            },
            AddedById: {
                type: DataTypes.STRING,
            },
            InfractionType: {
                type: DataTypes.INTEGER,
            },
            Infraction: {
                type: DataTypes.STRING,
            },
            TimeStamp: {
                type: DataTypes.DATE,
            }
        }, {
            tableName: "tblInfracs",
            sequelize
        })
    }
}