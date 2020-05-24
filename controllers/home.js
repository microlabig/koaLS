const { sendResponse } = require('../helpers');
const { UserAPI } = require('../api');

// ------------
//     GET
// ------------
module.exports.get = async (ctx, next) => {
  //   const { url } = await ctx.request;
  //   const { headers } = await ctx.response;
  //   let status = null;
  //   try {
  //     switch (url) {
  //       // получение профиля по JWT в authorization headers запроса
  //       case '/api/profile':
  //         if (headers.authorization) {
  //           // JWT-инфо
  //           // status = await UsersAPI.getUserByJWT(req.headers.authorization);
  //         }
  //         break;
  //       // получений новостей
  //       case '/api/news':
  //         //   status = await NewsAPI.getNews();
  //         break;
  //       // получение списка всех пользователей
  //       case '/api/users':
  //         //   status = await UsersAPI.getUsers();
  //         break;
  //       default:
  //         ctx.response.redirect('/');
  //         break;
  //     }
  //     if (status) {
  //       ctx.response.status(200).json(status);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
};

// ------------
//     POST
// ------------
module.exports.post = async (ctx, next) => {
  const { url } = ctx.request;
  const body = ctx.request.body;
  let userData = null;
  let newsData = null;
  let checkedUser = null;
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

    default:
      ctx.response.redirect('/');
      break;
  }
  sendResponse(ctx, status);

  //   const url = req.url;
  //   const body = req.body;
  //   let userData = null;
  //   let newsData = null;
  //   let checkedUser = null;

  //   switch (url) {
  //     // регистрация нового пользователя
  //     case '/api/registration':
  //       userData = await UsersAPI.packUserData(body);
  //       if (userData) {
  //         const newUser = new UserDB.User({ ...userData });
  //         const saveStatus = await UsersAPI.saveUserData(newUser);
  //         if (saveStatus) {
  //           const obj = await UsersAPI.checkUserData(body);
  //           res.status(201).json(UsersAPI.genToken(obj)); // "создано"
  //         } else {
  //           res.status(401).json({ message: 'Пользователь уже существует' }); // "нет содержимого"
  //         }
  //       } else {
  //         res.status(401).json({ message: 'Введите все поля' });
  //       }
  //       break;

  //     // логин пользователя
  //     case '/api/login':
  //       checkedUser = await UsersAPI.checkUserData(body);
  //       if (checkedUser) {
  //         req.session.isAuth = true;
  //         req.session.uid = checkedUser.id;
  //         res.status(202).json(UsersAPI.genToken(checkedUser)); // "принято"
  //       } else {
  //         res.status(401).json({ message: 'Ошибка ввода имени или пароля' }); // "не авторизован (не представился)"
  //       }
  //       break;

  //     // обновление токена
  //     case '/api/refresh-token':
  //       if (req.headers.authorization) {
  //         // JWT-инфо
  //         const findUser = await UsersAPI.getUserByJWT(req.headers.authorization);
  //         if (findUser) {
  //           res.status(201).json(UsersAPI.genToken(findUser));
  //         } else {
  //           res.status(500).json({ message: 'Пользователь в БД не найден' });
  //         }
  //       }
  //       break;

  //     // сохранение новости
  //     case '/api/news':
  //       if (req.headers.authorization) {
  //         // JWT-инфо
  //         const findedUser = await UsersAPI.getUserByJWT(
  //           req.headers.authorization
  //         );
  //         if (findedUser) {
  //           newsData = await NewsAPI.packNewsData(body, findedUser);
  //           if (newsData) {
  //             const newNews = new NewsDB.News({ ...newsData });
  //             const saveStatus = await NewsAPI.saveNews(newNews);
  //             if (saveStatus) {
  //               res.status(201).json(saveStatus); // "создано"
  //             } else {
  //               res.status(204).json({ message: 'Ошибка сохранения' }); // "нет содержимого"
  //             }
  //           }
  //         }
  //       } else {
  //         res.status(204).json({ message: 'Введите все поля' });
  //       }
  //       break;

  //     default:
  //       res.json({ success: false, err: 'Error' });
  //       break;
  //   }
};

// ------------
//    PATCH
// ------------
// изменение прав пользователя по id (permission)
module.exports.userPermissionUpdate = async (ctx, next) => {};

// изменение новости
module.exports.newsUpdate = async (ctx, next) => {};

// изменение профиля текущего пользователя
module.exports.profileUpdate = async (ctx, next) => {};

// ------------
//    DELETE
// ------------
module.exports.delete = async (ctx, next) => {};
