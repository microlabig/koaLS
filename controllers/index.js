const { sendResponse } = require('../helpers');
const { UserAPI, NewsAPI } = require('../api');

// ------------
//     GET
// ------------
module.exports.get = async (ctx, next) => {
  const { url } = ctx.request;
  let status = null;

  switch (url) {
    // получение профиля по JWT в authorization headers запроса
    case '/api/profile':
      status = await UserAPI.getUserByToken(ctx);
      break;
    // получений новостей
    case '/api/news':
      status = await NewsAPI.getNews();
      break;
    // получение списка всех пользователей
    case '/api/users':
      status = await UserAPI.getAllUsers();
      break;
    default:
      ctx.response.redirect('/');
      break;
  }
  sendResponse(ctx, status);
};

// ------------
//     POST
// ------------
module.exports.post = async (ctx, next) => {
  const { url, body } = ctx.request;
  let status = null;

  switch (url) {
    // регистрация нового пользователя
    case '/api/registration':
      status = await UserAPI.registerUser(body);
      break;

    // логин пользователя
    case '/api/login':
      status = await UserAPI.loginUser(body);
      if (status.code < 400) {
        ctx.session.isAuth = true;
        ctx.session.uid = status.payload.id;
      }
      break;

    // обновление токена
    case '/api/refresh-token':
      status = await UserAPI.refreshToken(ctx);
      break;

    // сохранение новости
    case '/api/news':
      const findUser = UserAPI.getUserByToken(ctx); // определим пользователя по JWT
      if (!findUser) {
        status = {
          code: 500,
          message: 'Пользователь не найден',
          payload: null
        };
      } else {
        status = await NewsAPI.saveNews(findUser, ctx);
      }
      break;

    default:
      break;
  }
  sendResponse(ctx, status);
};

// ------------
//    PATCH
// ------------
// изменение прав пользователя по id (permission)
module.exports.userPermissionUpdate = async (ctx, next) => {
  const status = await UserAPI.updateUserPermission(ctx);
  sendResponse(ctx, status);
};

// изменение новости
module.exports.newsUpdate = async (ctx, next) => {
  const status = await NewsAPI.updateNews(ctx);
  sendResponse(ctx, status);
};

// изменение профиля текущего пользователя
module.exports.profileUpdate = async (ctx, next) => {
  const status = await UserAPI.updateUserInfo(ctx);
  sendResponse(ctx, status);
};

// ------------
//    DELETE
// ------------
module.exports.delete = async (ctx, next) => {
  const path = ctx.request.url.match(/^\/?API\/.{0,5}\/?/i)[0];
  const { id } = ctx.params;
  let status = null;

  switch (path) {
    // удаление пользователя по id
    case '/api/users/':
      status = await UserAPI.deleteUser(id);
      break;

    // удаление новости по id
    // case '/api/news/':
    //   status = await NewsAPI.deleteNews(id);
    //   break;

    default:
      break;
  }
  sendResponse(ctx, status);
};
