const express = require("express");
const Route = express.Router({ mergeParams: true });
const reviewController = require("./../Controller/reviewController");
const authController = require("./../Controller/autuController");
Route.use(authController.protect);
Route.route("/")
  .get(reviewController.getAllReview)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.setTouruserid,
    reviewController.createReview
  );
Route.route("/:id")
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  );
module.exports = Route;
