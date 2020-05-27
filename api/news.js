const { validateData } = require('../helpers');
const News = require('../db').models.news;

const NOT_VALID_DATA = 'not valid data'; // "не все поля содержат информацию"

// ---------------------------
// ф-ия возвращает все новости
// ---------------------------
module.exports.getNews = async () => {
    try {
        // найдем все новости
        const news = await News.findAll();

        if (!news) {
            return { code: 500, message: 'Something is go wrong...', payload: null };
        }
        if (news.length === 0) {
            return { code: 200, message: 'Get news list', payload: [] };
        }

        // преобразуем инфо о пользователе
        const newsModified = newsList.map((news) => {
            // если пользователь удален, а новость осталась, то
            // заменим информацией-пустышкой о пользователе
            if (!news.user) {
                return {
                    ...news._doc,
                    user: {
                        id: -1,
                        firstName: '',
                        image: null,
                        middleName: '',
                        surName: '',
                        username: ''
                    }
                };
            }
            // TODO: поиск по ссылке пользователя в БД
            return news;
        });
        return { code: 200, message: 'Get users list', payload: newsModified };
    } catch (error) {
        return { code: 500, message: error.message, payload: null };
    }
};

// упаковка данных новости
module.exports.packNewsData = async (newsObj, userObj) => {
    // if (validateData(newsObj) && userObj) {
    //   const newsCount = await NewsDB.News.countDocuments({}); // количество документов в news
    //   let id = 0;

    //   // если есть документы
    //   if (newsCount) {
    //     // найдем последний добавленный документ
    //     const newsLast = await NewsDB.News.find().sort({ _id: -1 }).limit(1);
    //     // увеличим id на 1
    //     id = newsLast[0].id + 1;
    //   }

    //   return {
    //     id,
    //     text: newsObj.text,
    //     title: newsObj.title,
    //     created_at: new Date(Date.now()).toUTCString(),
    //     user: userObj._id
    //   };
    // }
    // return null;
};

// сохранение новости
// TODO:
module.exports.saveNews = async (findUser, ctx) => {
    const { body } = ctx.request;
    // проверка на валидацию данных
    if (!validateData(data)) {
        return { code: 401, message: NOT_VALID_DATA, payload: null };
    }
    // try {
    //   const doc = await newsObj.save();
    //   console.log('News saved:', doc);
    //   return await getNews();
    // } catch (error) {
    //   console.error(error);
    //   return false;
    // }
};

// удаление новости
module.exports.deleteNews = async (id) => {
    // try {
    //   const status = await NewsDB.News.deleteOne({ id });
    //   if (status && status.ok === 1) {
    //     console.log('News deleted:', status);
    //     return await getNews();
    //   } else {
    //     throw new Error('Ошибка удаления из БД');
    //   }
    // } catch (error) {
    //   console.error(error);
    //   return false;
    // }
};

// -------------------------------
// изменение текущей новости по id
// -------------------------------
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
        findNews.title = body.title;
        findNews.text = body.text;
        const status = await News.updateOne({ id }, findNews); // TODO: обновим новость
        if (!status) {
            return { code: 500, message: 'Ошибка обновления', payload: null };
        }
        return await this.getNews();
    } catch (error) {
        return { code: 500, message: error.message, payload: null };
    }
};
