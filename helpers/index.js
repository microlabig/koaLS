// отправка результатов на клиент в зависимости от статуса выполненной операции
module.exports.sendResponse = (ctx, status) => {
  // если нет статуса операции
  if (!status) {
    // редирект на главную
    return ctx.redirect('/');
  }
  const { code, message, payload } = status;
  ctx.status = code;
  if (code >= 400) {
    // если ошибка выполненной операции
    ctx.throw(code, message, payload);
  } else {
    // отправка успешного результата клиенту
    console.log(`\nOk! ${code}: ${message}\n`);
    ctx.response.status = code;
    ctx.body = payload;
  }
};

// валидация входных данных
module.exports.validateData = (obj) => {
  for (const item in obj) {
    if (obj.hasOwnProperty('newPassword')) {
      continue;
    }
    if (obj.hasOwnProperty(item)) {
      if (obj[item] === '') {
        return false;
      }
    }
  }
  return true;
};

const passport = require('koa-passport');
// аутентификация
module.exports.authenticate = async (ctx, next) => {
  await passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err) {
      ctx.throw({ code: 500, message: err.message, payload: null });
    }
    if (!user) {
      ctx.throw({
        code: 403,
        message: 'Укажите правильный email или пароль',
        payload: null
      });
      ctx.redirect('/');
    }
    await ctx.login(user, async (err) => {
      (await err)
        ? ctx.throw({ code: 403, message: err.message, payload: null })
        : ctx.redirect('/');
    });
  })(ctx, next);
};