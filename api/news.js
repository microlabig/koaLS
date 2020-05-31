const { validateData } = require('../helpers');
const newsModel = require('../db').models.news;

const NOT_VALID_DATA = 'Введите все поля'; // "не все поля содержат информацию"

// --------------------------------------
//                  NEWS
// --------------------------------------
class News {
  // ---------------------------
  // ф-ия возвращает все новости
  // ---------------------------
  async getAll() {
    try {
      // найдем все новости
      const newsList = await newsModel.findAll({
        include: [{ all: true, nested: true }]
      }); // include: User, где User = require('../db').models.users;

      if (!newsList) {
        return {
          code: 500,
          message: 'Something is go wrong...',
          payload: null
        };
      }
      if (newsList.length === 0) {
        return { code: 200, message: 'Get newsModel list', payload: [] };
      }
      // преобразуем инфо о пользователе
      const newsModified = newsList.map((newsModel) => {
        const user = newsModel.dataValues.user.dataValues;
        if (user.hasOwnProperty('password')) {
          delete user.password;
        }
        return {
          ...newsModel.dataValues,
          user
        };
      });
      return { code: 200, message: 'Get users list', payload: newsModified };
    } catch (error) {
      return { code: 500, message: error.message, payload: null };
    }
  }

  // ------------------
  // сохранение новости
  // ------------------
  async save(findUser, ctx) {
    const { body } = ctx.request;
    // проверка на валидацию данных
    if (!validateData(body)) {
      return { code: 401, message: NOT_VALID_DATA, payload: null };
    }
    try {
      const news = {
        ...body,
        user_id: findUser.id
      };
      const result = await newsModel.create(news);
      if (!result) {
        return {
          code: 500,
          message: 'Something is go wrong...',
          payload: null
        };
      }
      return await this.getAll();
    } catch (error) {
      return { code: 500, message: error.message, payload: null };
    }
  }

  // -----------------
  // изменение новости
  // -----------------
  async update(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;
    try {
      // найдем новость
      const findNews = await newsModel.findOne({ where: { id } });
      if (!findNews) {
        return { code: 404, message: 'Новость не найдена в БД', payload: null };
      }
      // заменим данные
      const currentUserId = findNews.dataValues.user_id;
      findNews.dataValues = { ...body, user_id: currentUserId };
      // обновим новость
      const status = await newsModel.update(findNews.dataValues, {
        where: { id },
        limit: 1
      });
      if (!status) {
        return { code: 500, message: 'Ошибка обновления', payload: null };
      }
      return await this.getAll();
    } catch (error) {
      return { code: 500, message: error.message, payload: null };
    }
  }

  // ----------------------
  // удаление новости по id
  // ----------------------
  async delete(id) {
    try {
      // удалим пользователя из БД
      const result = await newsModel.destroy({ where: { id } });
      if (!result) {
        return { code: 500, message: 'Ошибка удаления', payload: null };
      }
      return await this.getAll();
    } catch (error) {
      return { code: 500, message: error.message, payload: null };
    }
  }
}

module.exports = new News();
