const { validateData } = require('../helpers');
const User = require('../db').models.user;

const defaultUserPermission = {
  chat: {
    C: true,
    R: true,
    U: true,
    D: true
  },
  news: {
    C: true,
    R: true,
    U: true,
    D: true
  },
  settings: {
    C: true,
    R: true,
    U: true,
    D: true
  }
};

module.exports.registerUser = async (data) => {
  if (!validateData(data)) {
    throw new Error('Введите все поля');
  }
  const result = await User.create({
    ...data,
    permission: defaultUserPermission
  });
  if (result) {
    return result;
  } else {
    throw new Error('Пользователь уже существует');
  }
};
