const Review = require("./../models/reviewModel");
const catchAsync = require("./../utilits/catchAsync");
const handleFactor = require("./handleFactor");
exports.getAllReview = handleFactor.getAll(Review);
// exports.getAllReview = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);
//   res.status(200).json({
//     status: "success",
//     result: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
exports.setTouruserid = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
// exports.createReview = catchAsync(async (req, res, next) => {
//   // implemet  nested route
//   // if (!req.body.tour) req.body.tour = req.params.tourId;
//   // if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);
//   res.status(201).json({
//     status: "success",

//     data: {
//       reviews: newReview,
//     },
//   });
// });
exports.getReview = handleFactor.getOne(Review);
exports.createReview = handleFactor.createOne(Review);
exports.updateReview = handleFactor.updateOne(Review);
exports.deleteReview = handleFactor.deletOne(Review);
