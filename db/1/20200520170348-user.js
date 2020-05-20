'use strict';

module.exports = {
  // инструкции к следующему состоянию БД
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false, // false - не может быть null
          autoIncrement: true,
          primaryKey: true
        },
        username: Sequelize.STRING,
        firstName: Sequelize.STRING,
        image: Sequelize.STRING,
        middleName: Sequelize.STRING,
        surName: Sequelize.STRING,
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
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
        }
      },
      {
        charset: 'utf8'
      }
    );
  },
  // инструкции к предыдущему состоянию БД (откату)
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
