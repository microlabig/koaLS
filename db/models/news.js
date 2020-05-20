'use strict';
module.exports = (sequelize, DataTypes) => {
  const news = sequelize.define(
    'news',
    {
      text: DataTypes.TEXT,
      title: DataTypes.STRING,
      user: DataTypes.INTEGER
    },
    {}
  );
  news.associate = function (models) {
    // associations can be defined here
    news.belongTo(models.user, {
      foreignKey: 'user'
    });
  };
  return news;
};
