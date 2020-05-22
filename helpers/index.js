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

module.exports.sendStatus = (ctx, { status, goodCode, failCode }) => {
  if (status) {
    ctx.response.status = goodCode;
  } else {
    ctx.response.status = failCode;
  }
  ctx.body = status;
};
