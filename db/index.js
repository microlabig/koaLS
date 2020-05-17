const Sequelize = require('sequelize');
const path = require('path');
const dbPort = process.env.DB_PORT || 5432;
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, 'config.js'))[env];

const sequelize = new Sequelize(`postgres://${config.username}:${config.password}@${config.host}:${dbPort}/${config.database}`, config);

module.exports = sequelize;
