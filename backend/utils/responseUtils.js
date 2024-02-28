exports.successResponse = (res, data, message = 'Success') => {
    res.status(200).json({
      message,
      data,
    });
  };
  
  exports.errorResponse = (res, message = 'Error', statusCode = 400) => {
    res.status(statusCode).json({
      message,
    });
  };
  