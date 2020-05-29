const { validateData } = require('../helpers');
const { Model } = require('sequelize');
const News = require('../db').models.news;

const NOT_VALID_DATA = 'Введите все поля'; // "не все поля содержат информацию"

// ---------------------------
// ф-ия возвращает все новости
// ---------------------------
module.exports.getNews = async () => {
  try {
    // найдем все новости
    const newsList = await News.findAll({ include: Model.user });
    if (!newsList) {
      return { code: 500, message: 'Something is go wrong...', payload: null };
    }
    if (newsList.length === 0) {
      return { code: 200, message: 'Get news list', payload: [] };
    }

    // преобразуем инфо о пользователе
    const newsModified = newsList.map((news) => news.dataValues);
    return { code: 200, message: 'Get users list', payload: newsModified };
  } catch (error) {
    return { code: 500, message: error.message, payload: null };
  }
};

// ------------------
// сохранение новости
// ------------------
module.exports.saveNews = async (findUser, ctx) => {
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
    const result = await News.create(news);
    if (result && !result.dataValues) {
      return { code: 500, message: 'Something is go wrong...', payload: null };
    }
    return await this.getNews();
  } catch (error) {
    return { code: 500, message: error.message, payload: null };
  }
};

// -----------------
// изменение новости
// -----------------
module.exports.updateNews = async (ctx) => {
  const { id } = ctx.params;
  const { body } = ctx.request;
  try {
    // найдем новость
    const findNews = await News.findOne({ where: { id } });
    if (!findNews) {
      return { code: 404, message: 'Новость не найдена в БД', payload: null };
    }
    // заменим данные
    const currentUserId = findNews.dataValues.user_id;
    findNews.dataValues = { ...body, user_id: currentUserId };
    // обновим новость
    const status = await News.update(findNews.dataValues, {
      where: { id },
      limit: 1
    });
    if (!status) {
      return { code: 500, message: 'Ошибка обновления', payload: null };
    }
    return await this.getNews();
  } catch (error) {
    return { code: 500, message: error.message, payload: null };
  }
};

// ----------------------
// удаление новости по id
// ----------------------
module.exports.deleteNews = async (id) => {
  try {
    // удалим пользователя из БД
    const result = await News.destroy({ where: { id } });
    if (!result) {
      return { code: 500, message: 'Ошибка удаления', payload: null };
    }
    return await this.getNews();
  } catch (error) {
    return { code: 500, message: error.message, payload: null };
  }
};
