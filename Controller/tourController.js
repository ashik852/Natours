const Tour = require("./../models/tourModels");

const catchAsync = require("./../utilits/catchAsync");
const AppError = require("./../utilits/appError");
const handleFactor = require("./handleFactor");
const { updateOne } = require("../models/reviewModel");

exports.aliastopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summery,difficulty";
  next();
};

// EXECUTE QUERY
exports.getALLtours = handleFactor.getAll(Tour);
// exports.getALLtours = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitfield()
//     .pagenation();
//   //
//   const tours = await features.query;
//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// });
exports.getAtours = handleFactor.getOne(Tour, { path: "reviews" });
// find data using id
// exports.getAtours = catchAsync(async (req, res, next) => {
//   // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//   //   return next(new AppError("Invalid tour ID format", 404)); // 400 status কোড এবং কাস্টম বার্তা
//   // }
//   const tour = await Tour.findById(req.params.id).populate("reviews");
//   //  findbyid is the filter section..only return one id
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }
//   res.status(200).json({
//     status: "sucess",
//     data: {
//       tour,
//     },
//   });
// });
exports.createTour = handleFactor.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: "success",
//     data: {
//       tour: newTour,
//     },
//   });
// });
exports.PatchData = handleFactor.updateOne(Tour);

// exports.PatchData = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// });
exports.deleteAdata = handleFactor.deletOne(Tour);
// delet a data form json
// exports.deleteAdata = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(204).json({
//     status: "success",
//     data: null,
//   });
// });
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: "easy" } },
    },
  ]);
  if (!stats || stats.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No data found for this criteria",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyolan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plans = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $addFields: {
        startDates: {
          $toDate: { $substr: ["$startDates", 0, 10] }, // স্ট্রিং থেকে প্রথম 10 ক্যারেক্টার (YYYY-MM-DD)
        },
      },
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numToursStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numToursStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);
  if (!plans || plans.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No plans found for this year",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      plans,
    },
  });
});
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      AppError(
        "Please provide latitur and longitude in the formate lat,lng",
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  // console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitutr and longitude in the format lat,lng.",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
