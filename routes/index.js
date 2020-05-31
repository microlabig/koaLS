const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controllers');

// MW
const isAuth = async (ctx, next) => {
  // если в сессии текущего пользователя есть пометка о том, что он является авторизованным
  // иначе перебросить пользователя на главную страницу сайта
  console.log('(((',ctx.isAuthenticated());
  
  return ctx.isAuthenticated() ? next() : ctx.redirect('/');
};

// MW для лога url
router.all(/.*/, async (ctx, next) => {
  // для дебага в консоли
  console.log(`\n--- ${ctx.req.method} : ${ctx.req.url} ---`.toUpperCase());
  await next();
});

router.get(/.*$/, isAuth, ctrl.get);
router.post(/.*$/, ctrl.post);

router.patch('/api/users/:id/permission', ctrl.userPermissionUpdate);
router.patch('/api/news/:id', ctrl.newsUpdate);
router.patch('/api/profile', ctrl.profileUpdate);

router.delete('/api/*/:id', ctrl.delete);

module.exports = router;
