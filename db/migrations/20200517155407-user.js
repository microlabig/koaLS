'use strict';

module.exports = {
  // инструкции к следующему состоянию БД
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false, // false - не может быть null
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        unique: true
      },
      firstName: Sequelize.STRING,
      image: Sequelize.STRING,
      middleName: Sequelize.STRING,
      surName: Sequelize.STRING,
      permission: {
        chat: {
          C: Sequelize.BOOLEAN,
          R: Sequelize.BOOLEAN,
          U: Sequelize.BOOLEAN,
          D: Sequelize.BOOLEAN
        },
        news: {
          C: Sequelize.BOOLEAN,
          R: Sequelize.BOOLEAN,
          U: Sequelize.BOOLEAN,
          D: Sequelize.BOOLEAN
        },
        settings: {
          C: Sequelize.BOOLEAN,
          R: Sequelize.BOOLEAN,
          U: Sequelize.BOOLEAN,
          D: Sequelize.BOOLEAN
        }
      }
    });
  },
  // инструкции к предыдущему состоянию БД (откату)
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
