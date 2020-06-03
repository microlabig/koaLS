const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controllers');
const { checkUser } = require('../auth');

// MW для лога url
router.all(/.*/, async (ctx, next) => {
  // для дебага в консоли
  console.log(`\n--- ${ctx.req.method} : ${ctx.req.url} ---`.toUpperCase());
  await next();
});

router.get(/.*$/, checkUser, ctrl.get);

router.post(/.*$/, checkUser, ctrl.post);

router.patch('/api/users/:id/permission', ctrl.userPermissionUpdate);
router.patch('/api/news/:id', ctrl.newsUpdate);
router.patch('/api/profile', ctrl.profileUpdate);

router.delete('/api/*/:id', ctrl.delete);

module.exports = router;
