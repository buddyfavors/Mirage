const { Sequelize } = require ('sequelize');

module.exports = new Sequelize(
    "WS255237_Elysium",
    "WS255237_elysium",
    "Gl@35vn8", {
    host: "plesk.remote.ac",
    dialect: 'mariadb',
    timezone: 'Etc/GMT0'
});
