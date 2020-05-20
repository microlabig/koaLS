'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    firstName: DataTypes.STRING,
    image: DataTypes.STRING,
    middleName: DataTypes.STRING,
    permission: DataTypes.JSONB,
    surName: DataTypes.STRING,
    username: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      set: function(v) {
        // var salt = bcrypt.genSaltSync(5);
        // var password = bcrypt.hashSync(v, salt);
        const that = this;
        bcrypt.hash(this.password, 10, (err, hash) => {
          if (err) {
            throw new Error('Ошибка сохранения пароля!');
          }
          return that.setDataValue('password', hash);
        });
      }
    },
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};