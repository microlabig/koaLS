const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const dbPort = process.env.DB_PORT || 5432;
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, 'config.js'))[env];
const modelsFolderPath = './models';
const models = {};

const sequelize = new Sequelize(
  `postgres://${config.username}:${config.password}@${config.host}:${dbPort}/${config.database}`,
  config
);

fs
  .readdirSync(path.join(__dirname, modelsFolderPath))
  .forEach((file) => {
    const model = sequelize.import(
      path.join(__dirname, modelsFolderPath, file)
    );
    models[model.name] = model;
});

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

sequelize.models = models;

module.exports = sequelize;
