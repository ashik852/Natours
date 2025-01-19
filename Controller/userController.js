const User = require("./../models/userModel");
const catchAsync = require("./../utilits/catchAsync");
const AppError = require("./../utilits/appError");
const handleFactor = require("./handleFactor");
// specefic data user can modified
const filterObj = (obj, ...allowFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getalluser = handleFactor.getAll(User);
// exports.getalluser = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     result: users.length,
//     data: {
//       users,
//     },
//   });
// });
// only update by user only specefic field
exports.updateMe = catchAsync(async (req, res, next) => {
  //1) create a error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password update.plese use/updateMypassword",
        400
      )
    );
  }
  // 2)Filtered out unwanted fields names that are not allowed to be updated
  const filterBody = filterObj(req.body, "name", "email");
  // 3)Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
// do not update with this
exports.updateuser = handleFactor.updateOne(User);
// exports.updateuser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "this route not yet define",
//   });
// };
exports.deleteuser = handleFactor.deletOne(User);
// exports.deleteuser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "this route not yet define",
//   });
// };

exports.createuser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route not yet define! please use /signup insted",
  });
};
exports.getuser = handleFactor.getOne(User);
// exports.getuser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "this route not yet define",
//   });
// };
