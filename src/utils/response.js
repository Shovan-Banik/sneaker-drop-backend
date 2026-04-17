function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    status: statusCode,
    isSuccess: true,
    data,
  });
}

function failure(res, message, statusCode = 500) {
  return res.status(statusCode).json({
    status: statusCode,
    isSuccess: false,
    error: message,
  });
}

module.exports = { success, failure };
