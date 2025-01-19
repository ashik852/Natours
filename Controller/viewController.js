const Tour = require("../models/tourModels");
const catchAsync = require("../utilits/catchAsync");

exports.getOverview = catchAsync(async (req, res) => {
  // 1)get tour data from collection
  const tours = await Tour.find();

  // 2)build template
  // 3)render the template using data

  res.status(200).render("overview", {
    title: "All tours",
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data ,for the requested tour{include reviews and guides}
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "reviews rating user",
    // 2)Build template
    // 3)Render template using data from
  });
  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
  console.log(tour);
});
exports.getLoginFrom = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};
