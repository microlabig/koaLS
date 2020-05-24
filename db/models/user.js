'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'user',
    {
      firstName: DataTypes.STRING,
      image: DataTypes.STRING,
      middleName: DataTypes.STRING,
      permission: DataTypes.JSONB,
      surName: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING
    },
    {
      hooks: {
        // закодируем пароль перед сохранением пользователя
        beforeCreate: async (user) => {
          const password = user.password;
          user.password = await bcrypt.hash(password, 10);
        }
      },
      instanceMethods: {
        // проверка пароля
        validatePassword: async function (password) {
          console.log(1234566646356);

          return await bcrypt.compare(password, this.password);
        }
      }
    }
  );
  user.associate = function (models) {
    // associations can be defined here
  };

  return user;
};
