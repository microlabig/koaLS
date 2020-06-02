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
      status = await NewsAPI.getAll();
      break;

    // получение списка всех пользователей
    case '/api/users':
      status = await UserAPI.getAll();
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
  let findUser = null;

  switch (url) {
    // регистрация нового пользователя
    case '/api/registration':
      status = await UserAPI.register(body);
      break;

    // логин пользователя
    case '/api/login':
      if (ctx.isAuthenticated()) {
        status = { code: 200, message: 'Success', payload: ctx.session.user };
      } 
      break;

    // обновление токена
    case '/api/refresh-token':
      status = await UserAPI.refreshToken(ctx);
      break;

    // сохранение новости
    case '/api/news':
      findUser = await UserAPI.getUserByToken(ctx); // определим пользователя по JWT
      if (!findUser.payload) {
        status = {
          code: 500,
          message: 'Пользователь не найден',
          payload: null
        };
      } else {
        status = await NewsAPI.save(findUser.payload, ctx);
      }
      break;
  }
  sendResponse(ctx, status);
};

// ------------
//    PATCH
// ------------
// изменение прав пользователя по id (permission)
module.exports.userPermissionUpdate = async (ctx, next) => {
  const status = await UserAPI.updatePermission(ctx);
  sendResponse(ctx, status);
};

// изменение новости
module.exports.newsUpdate = async (ctx, next) => {
  const {
    headers: { authorization: jwtData } // JWT-инфо
  } = ctx.req;
  let status = null;

  if (!jwtData) {
    status = { code: 404, message: 'No Data', payload: null };
  }
  status = await NewsAPI.update(ctx);
  sendResponse(ctx, status);
};

// изменение профиля текущего пользователя
module.exports.profileUpdate = async (ctx, next) => {
  const status = await UserAPI.update(ctx);
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
      status = await UserAPI.delete(id);
      break;

    // удаление новости по id
    case '/api/news/':
      status = await NewsAPI.delete(id);
      break;
  }
  sendResponse(ctx, status);
};
