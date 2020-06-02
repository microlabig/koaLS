const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt; // авторизация через JWT

const { UserAPI } = require('../api');

module.exports.passwordSessionSetup = (app) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    // найти пользователя с данным id в БД
    const user = await UserAPI.getUserById(id);
    done(null, user.payload);
  });

  // локальная стратегия
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username'
      },
      async (username, password, done) => {
        const result = await UserAPI.login({ username, password });
        if (result.code >= 400) {
          return done(result);
        }
        return done(null, result.payload);
      }
    )
  );

  // JWT-стратегия
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(''), // '' - В headers.authorization = `${jwt}`, т.е. если необходимо напр. `BEARER ${jwt}`, то fromAuthHeaderWithScheme('BEARER ')
    secretOrKey: process.env.JWT_SECRET || 'secret'
  };
  passport.use(
    new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
        console.log('jwtPayload', jwtPayload);
        
      const result = await UserAPI.getUserByToken(jwtPayload);
      if (result.code >= 400) {
        return done(result);
      }
      return done(null, result.payload);
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
};

// аутентификация
const authenticateLocal = async (ctx, next) => {
  await passport.authenticate('local', async (err, user, info) => {
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
    try {
      await ctx.login(user); // логинимся
      ctx.session.user = user; // для передачи данных пользователю
    } catch (error) {
      ctx.throw({ code: 403, message: error.message, payload: null });
    }
  })(ctx, next);
};

// аутентификация JWT
const authenticateJWT = async (ctx, next) => {
  await passport.authenticate(
    'jwt',
    // { session: false },
    async (err, user, info) => {
        console.log('JWT', info);
      if (err) {
        ctx.throw({ code: 500, message: err.message, payload: null });
      }
      if (!user) {
        // ctx.throw({
        //   code: 403,
        //   message: 'Укажите правильный email или пароль',
        //   payload: null
        // });
        ctx.redirect('/');
      }
      

      try {
        await ctx.login(user); // логинимся
        ctx.session.user = user; // для передачи данных пользователю
      } catch (error) {
        ctx.throw({ code: 403, message: error.message, payload: null });
      }
    }
  )(ctx, next);
};

// проверка пользователя (логин пользователя)
module.exports.checkUser = async (ctx, next) => {
  const { url } = ctx.request;
  // если запрос на вход
  switch (url) {
    // получение профиля по JWT в authorization headers запроса
    case '/api/profile':
      await authenticateJWT(ctx, next);
      break;

    case '/api/login': // POST
      // проверить пользователя
      await authenticateLocal(ctx, next);
      break;
  }
  return await next();
};
