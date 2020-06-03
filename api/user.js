const formidable = require('formidable');
const path = require('path');
const Jimp = require('jimp'); // для сжатия аватарок и их обрезка до квадратных пропорций
const fs = require('fs');
const util = require('util');
const unlink = util.promisify(fs.unlink); // делаем из ф-ии колбека ф-ию промис
const moment = require('moment');
const jwt = require('jwt-simple');

const { validateData } = require('../helpers');
const userModel = require('../db').models.user;

const USER_ALREADY_EXIST = '23505'; // "пользователь уже есть в БД"
const USER_WRONG_PASSWORD = 'Пароль не верный'; // "неверный пароль"
const USER_NOT_FOUND = 'Пользователь не найден'; // "пользователь не найден"
const NOT_VALID_DATA = 'Введите все поля'; // "не все поля содержат информацию"
// права пользователя по-умолчанию
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

// --------------------------------------
//                  USER
// --------------------------------------
class User {
  // ------------------------------------------
  // возвращает список всех пользователей из БД
  // ------------------------------------------
  async getAll() {
    const usersList = await userModel.findAll();
    if (usersList && usersList.length > 0) {
      const usersData = usersList.map((user) => {
        if (user.dataValues.hasOwnProperty('password')) {
          delete user.dataValues.password;
        }
        return user.dataValues;
      });
      return { code: 200, message: 'Get users list', payload: usersData };
    }
    return { code: 200, message: 'Users list is empty', payload: [] };
  }

  // ------------------------
  // регистрация пользователя
  // ------------------------
  async register(data) {
    // проверка на валидацию данных
    if (!validateData(data)) {
      return { code: 500, message: NOT_VALID_DATA, payload: null };
    }
    // сохранение пользователя
    try {
      const result = await userModel.create({
        ...data,
        permission: defaultUserPermission
      });
      // если пользователь успешно создан в БД
      if (!result) {
        return {
          code: 500,
          message: 'Something is go wrong...',
          payload: null
        };
      }
      // отправим сообщение клиенту об успехе
      return {
        code: 201,
        message: 'Пользователь зарегистрирован',
        payload: result
      };
    } catch (error) {
      // если уже есть в БД с таким же username
      if (error.original && error.original.code === USER_ALREADY_EXIST) {
        return {
          code: 403,
          message: 'Пользователь уже существует',
          payload: null
        };
      }
      return { code: 500, message: error.message, payload: null };
    }
  }

  // ------------------
  // логин пользователя
  // ------------------
  async login(data) {
    // проверка на валидацию данных
    if (!validateData(data)) {
      return { code: 401, message: NOT_VALID_DATA, payload: null };
    }
    // поиск пользователя
    try {
      const result = await userModel.findOne({
        where: { username: data.username }
      });
      // пользователь не найден в БД
      if (!result) {
        return { code: 404, message: USER_NOT_FOUND, payload: null };
      }
      // если есть пользователь в БД - проверяем валидность пароля
      const isValidPassword = await result.validatePassword(data.password);
      // неправильный пароль
      if (!isValidPassword) {
        return { code: 401, message: USER_WRONG_PASSWORD, payload: null };
      }
      // если пароль верныый - сгенерируем токены для user
      const user = this.genToken(result.dataValues);
      // удаляем свойство password для дальнейшей передачи клиенту объекта user
      if (user.hasOwnProperty('password')) {
        delete user.password;
      }
      return { code: 202, message: 'Успешный вход', payload: user };
    } catch (error) {
      return { code: 500, message: error.message, payload: null };
    }
  }

  // -----------------
  // генерация токенов
  // -----------------
  genToken(user) {
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
  }

  // ---------------------------------
  // возвращает пользователя по токену
  // ---------------------------------
  async getUserById(id) {
    if (!id) {
      return { code: 500, message: 'No Id', payload: null };
    }
    try {
      const findUser = await userModel.findOne({ where: { id } });
      // пользователь не найден в БД
      if (!findUser) {
        return { code: 500, message: USER_NOT_FOUND, payload: null };
      }
      // удалим поле password для передачи данных пользователю
      if (findUser.dataValues.hasOwnProperty('password')) {
        delete findUser.dataValues.password;
      }
      return {
        code: 202,
        message: 'Пользователь найден',
        payload: findUser.dataValues
      };
    } catch (error) {
      return { code: 500, message: error.message, payload: null };
    }
  }

  // ---------------------------------
  // возвращает пользователя по токену
  // ---------------------------------
  async getUserByToken(jwtData) {
    console.log('jwtData', jwtData);
    
      const { username } = jwt.decode(jwtData, process.env.JWT_SECRET, true);
      await this.getUserByUsername(username);
  }

  // -----------------------------------
  // возвращает пользователя по username
  // -----------------------------------
  async getUserByUsername(username) {
    try {
      const findUser = await userModel.findOne({ where: { username } });
      // пользователь не найден в БД
      if (!findUser) {
        return { code: 500, message: USER_NOT_FOUND, payload: null };
      }
      // удалим поле password для передачи данных пользователю
      if (findUser.dataValues.hasOwnProperty('password')) {
        delete findUser.dataValues.password;
      }
      return {
        code: 202,
        message: 'Пользователь найден',
        payload: findUser.dataValues
      };
    } catch (error) {
      if (error.message && error.message === USER_NOT_FOUND) {
        return { code: 404, message: 'Пользователь не найден', payload: null };
      }
      return { code: 500, message: error.message, payload: null };
    }
  }

  // -------------------------------
  // обновление токенов пользователя
  // -------------------------------
  async refreshToken(jwtData) {
    // найдем пользователя в БД
    const findUser = await this.getUserByToken(jwtData);
    // если пользователя нет в БД
    if (findUser && !findUser.payload) {
      return { code: 404, message: 'Пользователь не найден', payload: null };
    }
    const userWithTokens = this.genToken(findUser.payload);
    return {
      code: 202,
      message: 'Пользователь найден',
      payload: userWithTokens
    };
  }

  // ------------------------------------
  // обновление информации о пользователе
  // ------------------------------------
  async update(ctx) {
    const {
      headers: { authorization: jwtData } // JWT-инфо
    } = ctx.req;
  
    if (!jwtData) {
      return { code: 404, message: 'No Data', payload: null };
    }

    // найдем пользователя, которого необходимо изменить
    const findUser = await this.getUserByToken(jwtData);

    if (findUser && !findUser.payload) {
      return {
        code: 404,
        message: 'Пользователь не найден в БД',
        payload: null
      };
    }

    try {
      return await new Promise((resolve, reject) => {
        // входные данные
        const form = new formidable.IncomingForm();
        // папка загрузки
        const upload = path.join('/public', 'assets', 'users');
        // сформируем полный путь до папки загрузки
        form.uploadDir = path.join(process.cwd(), upload);

        // если папки загрузки аватарок не существует
        if (!fs.existsSync(form.uploadDir)) {
          fs.mkdirSync(form.uploadDir);
        } else {
          // удалим старый аватар при его наличии
          if (findUser.payload.image) {
            const oldAvatar = path.join(
              process.cwd(),
              '/public',
              findUser.payload.image
            );
            if (fs.existsSync(oldAvatar)) {
              (async () => {
                await unlink(oldAvatar);
              })();
            }
          }
        }

        // распарсим входные данные
        form.parse(ctx.req, (err, fields, files) => {
          if (err) {
            reject({ code: 500, message: err.message, payload: null });
          }

          const isValid = files.avatar && validateData(fields);

          // если все данные валидны, запишем в базу
          if (!isValid) {
            reject({
              code: 500,
              message: 'Неверно заполнены данные',
              payload: null
            });
          }
          // путь, относительно корневой директории
          const fileName = path.join(upload, files.avatar.name);
          const newName = path.join(process.cwd(), fileName);
          // переименуем файл со случайно сгенерированным именем в имя, которое клиент отправил
          fs.rename(files.avatar.path, newName, async (err) => {
            if (err) {
              reject({ code: 500, message: err.message, payload: null });
            }

            // взять оставшуюся часть пути, начиная с assets
            const pathToImage = fileName.substr(fileName.indexOf('assets'));
            // если пользователь отправил новый пароль, обновим его, иначе оставим старый
            const password = fields.newPassword
              ? fields.newPassword
              : fields.oldPassword;

            // обновление БД
            try {
              // читаем аватар
              const jimpedFile = await Jimp.read(newName);
              // изменяем размер аватара
              jimpedFile
                .cover(384, 384) // resize
                .crop(0, 0, 384, 384) // cropping
                .quality(60) // set PNG or JPEG quality
                .write(newName); // save
              // обновим инфо
              const newUserInfo = {
                ...findUser.payload,
                ...fields,
                image: pathToImage,
                password
              };
              // обновим пользователя в БД
              const status = await userModel.update(newUserInfo, {
                where: { id: findUser.payload.id },
                limit: 1
              });
              if (!status && !status[0]) {
                reject({
                  code: 500,
                  message: 'Ошибка обновления',
                  payload: null
                });
              }
              // удалим пароль для передачи ответных данных
              if (newUserInfo.hasOwnProperty('password')) {
                delete newUserInfo.password;
                delete newUserInfo.oldPassword;
                delete newUserInfo.newPassword;
              }
              resolve({
                code: 201,
                message: 'Информация обновлена',
                payload: newUserInfo
              });
            } catch (error) {
              reject({ code: 500, message: error.message, payload: null });
            }
          });
        });
      });
    } catch (error) {
      return { code: 500, message: error.message, payload: null };
    }
  }

  // ----------------------------
  // обновление прав пользователя
  // ----------------------------
  async updatePermission(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;
    try {
      const user = await userModel.findOne({ where: { id } });
      if (!user) {
        return { code: 500, message: 'Пользователь не найден', payload: null };
      }
      user.dataValues.permission = { ...body.permission };
      const status = await userModel.update(user.dataValues, { where: { id } });
      if (!status) {
        return { code: 500, message: 'Ошибка обновления прав', payload: null };
      }
      return await this.getAll();
    } catch (error) {
      return { code: 500, message: error.message, payload: null };
    }
  }

  // --------------------------
  // удаляет пользователя по id
  // --------------------------
  async delete(id) {
    try {
      const findUser = await userModel.findOne({ where: { id } });
      if (!findUser) {
        return { code: 404, message: 'Пользователь не найден', payload: null };
      }
      // удалим пользователя из БД
      const result = await userModel.destroy({ where: { id } });
      if (!result) {
        return { code: 500, message: 'Ошибка удаления', payload: null };
      }
      if (findUser.dataValues.image) {
        // удалим аватар удаляемого пользователя
        await unlink(
          path.join(process.cwd(), 'public', findUser.dataValues.image)
        );
      }
      return await this.getAll();
    } catch (error) {
      return { code: 500, message: error.message, payload: null };
    }
  }
}

module.exports = new User();
