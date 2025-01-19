const AppError = require("./../utilits/appError");
const handleError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  // const value = err.errmsg.match(/\[([0-9A-Z:]+)\]/);
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValdationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJwtError = () =>
  new AppError("Invalid token. Please log in again", 401);
const handleJWTExpiredError = () =>
  new AppError("your token has expired! Please log in again", 401);

// const handleDuplicateFieldDB = (err) => {
//   console.log("Error in handleDuplicateFieldDB:", err);
//   if (err.keyValue) {
//     const field = Object.keys(err.keyValue)[0];
//     const value = err.keyValue[field];
//     const message = `Duplicate field value: ${value}. Please use another value!`;
//     return new AppError(message, 400);
//   } else {
//     // যদি keyValue না থাকে, তাহলে ডিফল্ট মেসেজ ফেরত দিন
//     return new AppError("Duplicate field error. Please check your input.", 400);
//   }
// };

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational ,trusted error:send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //  Programing of other unknown error  error:don"t leak error details
  } else {
    // 1) log error
    console.log("ERROR 🧨🎇", err);
    // 2) send generic message
  }
  res.status(500).json({
    status: "error",
    message: "Something went very wrong",
  });
};

module.exports = (err, req, res, next) => {
  // console.log("Error Middleware Triggered");
  // console.error(err.stack);
  // if (err.stack) {
  //   console.log(err.stack);
  // } else {
  //   console.error("Error details:", err);
  // }
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    // console.error("error details", error);
    // let error = Object.create(err); // ডিপ ক্লোনিং করা হয়েছে
    // let error = JSON.parse(JSON.stringify(err));error.kind === "ObjectId" ||
    // console.log("Error name:", error.name);
    // console.log("Error kind:", error.kind);
    // console.log("Error name:", error.name); // লগ করে চেক করুন
    console.log("Error message:", error.message);
    if (error.name === "CastError") {
      error = handleError(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldDB(error);
    }
    if (error.name === "ValidationError") error = handleValdationError(error);
    if (error.name === "JsonWebTokenError") error = handleJwtError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
