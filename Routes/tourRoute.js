const express = require("express");
const tourController = require("./../Controller/tourController");
const authController = require("./../Controller/autuController");
const reviewController = require("./../Controller/reviewController");
const reviewRouter = require("./../Routes/reviewRoute");
const AppError = require("./../utilits/appError");
const router = express.Router();
// POST/TOUR/234U4/REVIEWS
// // GET/TOUR/234U4/REVIEWS
// // POST/TOUR/234U4/REVIEWS/U435Y734
// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview
//   );
router.use("/:tourId/reviews", reviewRouter);
// router.param("id", tourController.checkID);
// finding all data
router
  .route("/top-5-cheap")
  .get(tourController.aliastopTours, tourController.getALLtours);
router.route("/tour-stats").get(tourController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyolan
  );
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getTourWithin);

// tours-distance?distance=223,center=23.7505976,90.4181604,700,&unitt=mi
// tours-within/233/center/23.7505976,90.4181604/unit/mi
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);
router
  .route("/")
  // .get(authController.protect, tourController.getALLtours)
  .get(tourController.getALLtours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getAtours)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteAdata
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.PatchData
  );

//
module.exports = router;
