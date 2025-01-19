// review /rating /createAt/ref to tour / ref to user
const mongoose = require("mongoose");
const User = require("./userModel");
const Tour = require("./tourModels");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a user"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belobg to a user"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
// one user provide one review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name photo",
  // });
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});
reviewSchema.statics.calcAverageRating = async function (tourId) {
  // console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
reviewSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAverageRating(this.tour);
});
// update a review
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.clone().this.findOne();

//   console.log(this.r);
//   next();
// });
// const mongoose = require("mongoose");

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // try {
  // const query = this.getQuery(); // Get the query
  // if (query._id && !mongoose.Types.ObjectId.isValid(query._id)) {
  //   throw new Error(`Invalid ObjectId: ${query._id}`);
  // }
  this.r = await this.clone().findOne(); // Clone ensures no mutation
  //   if (!this.r) {
  //     console.log("No document found for the query!");
  //   }
  //   next();
  // } catch (err) {
  //   console.error("Error in pre-findOneAnd middleware:", err);
  //   next(err);
  // }
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() does not work here , query has alredy executed
  await this.r.constructor.calcAverageRating(this.r.tour);
});
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
