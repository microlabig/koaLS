require('dotenv').config();

const Koa = require('koa');
const app = new Koa();
const serve = require('koa-static');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const session = require('koa-session');
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
const socketRun = require('./chat');
const db = require('./db');

const secretKey = process.env.secretKey || 'secret key session';
const CONFIG_COOKIE = {
  key: secretKey,
  path: '/',
  httpOnly: true,
  maxAge: 10 * 60 * 1000
};
const PORT = process.env.PORT || 3000;

// статика
app.use(serve('./public'));

// парсинг post запросов от клиента
app.use(koaBody());

// session cookie
app.keys = [secretKey];
app.use(session(CONFIG_COOKIE, app));

// обработчик ошибок
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status >= 400) {
      ctx.throw(ctx.status);
    }
  } catch (err) {
    console.error(err);
    ctx.response.status = ctx.status;
    ctx.body = { message: err.message };
  }
});

// роутер
app.use(cors());
app.use(require('./routes').routes());

// подключение к БД (postgres)
db.authenticate()
  .then(() => {
    console.log('Connection to DB has been established successfully');
  })
  .catch(console.error);

// основной сервер
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// чат на socket.io
socketRun(io);

// в случае неопредеенной ошибки
process.on('uncaughtException', (err) => {
  console.error(
    `${new Date().toUTCString()} uncaught exception: ${err.message}`
  );
  console.error(err.stack);
  process.exit(1);
});
