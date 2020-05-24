const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp'); // для сжатия аватарок и их обрезка до квадратных пропорций
const util = require('util');
const unlink = util.promisify(fs.unlink); // делаем из ф-ии колбека ф-ию промис

const moment = require('moment');
const jwt = require('jwt-simple');

const { validateData } = require('../helpers');
const User = require('../db').models.user;

const USER_ALREADY_EXIST = '23505'; // пользователь уже есть в БД

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

// регистрация пользователя
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
    // если успешно создан
    if (result) {
      return {
        code: 201,
        message: 'Пользователь зарегестрирован',
        payload: result
      };
    }
  } catch (error) {
    switch (error.original.code) {
      // если уже есть в БД с таким же username
      case USER_ALREADY_EXIST:
        return {
          code: 403,
          message: 'Пользователь уже существует',
          payload: null
        };
      default:
        break;
    }
  }
  return { code: 500, message: 'Ошибка сервера', payload: null };
};

// логин пользователя
module.exports.loginUser = async (data) => {
  // проверка на валидацию данных
  if (!validateData(data)) {
    throw new Error('Введите все поля');
  }
  // поиск пользователя
  try {
    const result = await User.findOne({ where: { username: data.username } });

    if (result) {
        // console.log('\n');
        // console.log(result);
        // console.log('\n');
        
      if (result.validatePassword(result.dataValues.password)) {
        const user = this.genToken(result.dataValues);

        if (user.hasOwnProperty('password')) {
          delete user.password;
        }
        return {
          code: 202,
          message: 'Успешный вход',
          payload: user
        };
      } else {
        throw new Error('Пароль не верный');
      }
    } else {
      throw new Error('Пользователь не найден');
    }
  } catch (error) {
    return {
      code: 404,
      message: error.message,
      payload: null
    };
  }
  return { code: 500, message: 'Ошибка сервера', payload: null };
};

// генерация токенов
module.exports.genToken = (user) => {
  const accessTokenExpiredAt = moment().utc().add({ minutes: 30 }).unix();
  const accessToken = jwt.encode(
    {
      exp: accessTokenExpiredAt,
      username: user.username
    },
    process.env.JWT_SECRET
  );
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
    accessToken: accessToken,
    accessTokenExpiredAt: Date.parse(
      moment.unix(accessTokenExpiredAt).format()
    ),
    refreshToken: refreshToken,
    refreshTokenExpiredAt: Date.parse(
      moment.unix(refreshTokenExpiredAt).format()
    )
  };
};
