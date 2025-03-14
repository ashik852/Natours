const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const AppError = require("./../utilits/appError");
const catchAsync = require("./../utilits/catchAsync");
const sendEmail = require("./../utilits/mailer");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOption = {
    expires: console.log(
      new Date(
        Date.now() +
          (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
      )
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOption.secure = true;
  res.cookie("jwt", token, cookieOption);
  // Remove password from output
  user.password = undefined;
  //
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1_)check the email and password exist
  if (!email || !password) {
    next(new AppError("Please provide email and password! ", 400));
  }
  // 2) check if user exists && password is incorrect

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // if everything ok, send token to client
  createSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: success });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1)getting tooken and check of it there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }
  // 2)verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3)check if user still exists
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return new AppError(
      "the user belonging to this token does no longer exist",
      401
    );
  }
  // 4)check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError("User recetly changed password! Please log in again.", 401)
    );
  }
  //  grant acces to protected route
  req.user = currentUser;
  next();
});
// only for render pages ..no errors
exports.isLoggeIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 2)verify token
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3)check if user still exists
      const currentUser = await User.findById(decode.id);
      if (!currentUser) {
        return next();
      }
      // 4)check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decode.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      // console.log(currentUser);
      // console.log(res.locals.user);

      return next();
    } catch (err) {
      // proceed if any error occurs
      return next();
    }
  } else {
    // proceed if no jwt is present
    return next();
  }
  next();
});

exports.restrictTo = (...roles) => {
  // roles ["admin","lead-guide"].role=user
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};
// forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2)Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3)Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password ? Submit a PATCH request withyour new password and passwordConfirm to:${resetURL}.\n If you don't forget your password,please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later", 500)
    );
  }
});
// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1)Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2)If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3)Updte changepassword at property for the user
  // 4)Log the user in ,send JWT
  createSendToken(user, 200, res);
});
// changing password without using forgot password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1)Get user from collection
  const user = await User.findById(req.user.id).select("+password");
  // 2)Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }
  // 3)if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4)Log user in send JWT
  createSendToken(user, 200, res);
});
