// отправка результатов на клиент в зависимости от статуса выполненной операции
module.exports.sendResponse = (ctx, status) => {
  const { code, message, payload } = status;
  ctx.status = code;
  if (code >= 400) {
    ctx.throw(code, message, payload);
  } else {
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
