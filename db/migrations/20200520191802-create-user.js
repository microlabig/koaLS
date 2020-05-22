'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      middleName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      permission: {
        type: Sequelize.JSONB,
        allowNull: false,
        value: {
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
      },
      surName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      username: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};