const formidable = require('formidable');
const path = require('path');
const Jimp = require('jimp'); // для сжатия аватарок и их обрезка до квадратных пропорций
const fs = require('fs');
const util = require('util');
const unlink = util.promisify(fs.unlink); // делаем из ф-ии колбека ф-ию промис
const moment = require('moment');
const jwt = require('jwt-simple');

const { validateData } = require('../helpers');
const User = require('../db').models.user;

const USER_ALREADY_EXIST = '23505'; // пользователь уже есть в БД
const USER_WRONG_PASSWORD = 'wrong password';
const USER_NOT_FOUND = 'user not found';

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

// ------------------------
// регистрация пользователя
// ------------------------
module.exports.registerUser = async (data) => {
  // проверка на валидацию данных
  if (!validateData(data)) {
    throw new Error('Введите все поля');
  }
  // сохранение пользователя
  try {
    const result = await User.create({
      ...data,
      permission: defaultUserPermission
    });
    // если пользователь успешно создан в БД
    if (result) {
      // отправим сообщение клиенту об успехе
      return {
        code: 201,
        message: 'Пользователь зарегистрирован',
        payload: result
      };
    }
  } catch (error) {
    // если уже есть в БД с таким же username
    if (error.original && error.original.code === USER_ALREADY_EXIST) {
      return {
        code: 403,
        message: 'Пользователь уже существует',
        payload: null
      };
    } else if (error.code) {
      return {
        code: 500,
        message: error.message,
        payload: null
      };
    }
  }
  return { code: 500, message: 'Something is go wrong...', payload: null };
};

// ------------------
// логин пользователя
// ------------------
module.exports.loginUser = async (data) => {
  // проверка на валидацию данных
  if (!validateData(data)) {
    throw new Error('Введите все поля');
  }
  // поиск пользователя
  try {
    const result = await User.findOne({ where: { username: data.username } });
    // если есть пользователь в БД
    if (result) {
      const isValidPassword = await result.validatePassword(data.password);
      // проверяем валидность пароля
      if (isValidPassword) {
        // если пароль верныый - сгенерируем токены для user
        const user = this.genToken(result.dataValues);
        // удаляем свойство password для дальнейшей передачи клиенту объекта user
        if (user.hasOwnProperty('password')) {
          delete user.password;
        }
        return {
          code: 202,
          message: 'Успешный вход',
          payload: user
        };
      } else {
        // неправильный пароль
        throw new Error(USER_WRONG_PASSWORD);
      }
    } else {
      // пользователь не найден в БД
      throw new Error(USER_NOT_FOUND);
    }
  } catch (error) {
    let errorObj = null;
    switch (error.message) {
      case USER_WRONG_PASSWORD:
        errorObj = { code: 401, message: 'Пароль не верный' };
        break;
      case USER_NOT_FOUND:
        errorObj = { code: 404, message: 'Пользователь не найден' };
        break;
      default:
        errorObj = { code: 500, message: 'Something is go wrong...' };
        break;
    }
    return { ...errorObj, payload: null };
  }
  // return { code: 500, message: 'Ошибка сервера', payload: null };
};

// -----------------
// генерация токенов
// -----------------
module.exports.genToken = (user) => {
  // access-токен
  const accessTokenExpiredAt = moment().utc().add({ minutes: 30 }).unix();
  const accessToken = jwt.encode(
    {
      exp: accessTokenExpiredAt,
      username: user.username
    },
    process.env.JWT_SECRET
  );
  // refresh-токен
  const refreshTokenExpiredAt = moment().utc().add({ days: 30 }).unix();
  const refreshToken = jwt.encode(
    {
      exp: refreshTokenExpiredAt,
      username: user.username
    },
    process.env.JWT_SECRET
  );
  return {
    ...user,
    accessToken,
    accessTokenExpiredAt: Date.parse(
      moment.unix(accessTokenExpiredAt).format()
    ),
    refreshToken,
    refreshTokenExpiredAt: Date.parse(
      moment.unix(refreshTokenExpiredAt).format()
    )
  };
};

// ---------------------------------
// возвращает пользователя по токену
// ---------------------------------
module.exports.getUserByToken = async (jwtData) => {
  try {
    const decodedData = jwt.decode(jwtData, process.env.JWT_SECRET);
    const { username } = decodedData;
    const findUser = await User.findOne({ where: { username } });

    if (findUser) {
      if (findUser.dataValues.hasOwnProperty('password')) {
        delete findUser.dataValues.password;
      }
      return {
        code: 202,
        message: 'Пользователь найден',
        payload: findUser
      };
    } else {
      // пользователь не найден в БД
      throw new Error(USER_NOT_FOUND);
    }
  } catch (error) {
    if (error.message && error.message === USER_NOT_FOUND) {
      return { code: 404, message: 'Пользователь не найден', payload: null };
    }
  }
  return { code: 500, message: 'Something is go wrong...', payload: null };
};

// ------------------------------------------
// возвращает список всех пользователей из БД
// ------------------------------------------
module.exports.getAllUsers = async () => {
  const users = await User.findAll();
  if (users && users.length > 0) {
    const usersData = users.map((user) => user.dataValues);
    return { code: 200, message: 'Get users list', payload: usersData };
  }
  return { code: 200, message: 'Users list is empty', payload: [] };
};

// -------------------------------
// обновление токенов пользователя
// -------------------------------
module.exports.refreshUserToken = async (jwtData) => {
  if (jwtData) {
    // найдем пользователя в БД
    let findUser = await this.getUserByToken(jwtData);
    if (findUser) {
      findUser = this.genToken(findUser);
      return {
        code: 202,
        message: 'Пользователь найден',
        payload: findUser
      };
    } else {
      return { code: 404, message: 'Пользователь не найден', payload: null };
    }
  }
  return { code: 500, message: 'Something is go wrong...', payload: null };
};
