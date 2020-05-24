const path = require('path');
const Router = require('koa-router');
const router = new Router();
const ctrlHome = require(path.join(__dirname, '..', 'controllers', 'home'));

// MW
const isAuth = async (ctx, next) => {
  // если в сессии текущего пользователя есть пометка о том, что он является авторизованным
  // иначе перебросить пользователя на главную страницу сайта
  return ctx.session.isAuth ? next() : ctx.redirect('/login');
};

// MW для лога url
router.get(/.*/, async (ctx, next) => {
  // для дебага в консоли
  console.log(`\n--- ${ctx.request.method} : ${ctx.request.url} ---`.toUpperCase());
  await next();
});

router.get(/.*$/, isAuth, ctrlHome.get);
router.post(/.*$/, ctrlHome.post);

router.patch('/api/users/:id/permission', ctrlHome.userPermissionUpdate);
router.patch('/api/news/:id', ctrlHome.newsUpdate);
router.patch('/api/profile', ctrlHome.profileUpdate);

router.delete('/api/*/:id', ctrlHome.delete);

module.exports = router;
