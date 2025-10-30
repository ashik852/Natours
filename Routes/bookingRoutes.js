const express = require("express");
const router = express.Router();
const bookingController = require("../Controller/bookingController");
const authController = require("../Controller/autuController"); //  protect middleware
const { protect, restrictTo } = require("../Controller/autuController");
router.use(authController.protect);

// Booking create (tour id take form URL )
router.post(
  "/tour/:tourId",
  authController.protect,
  bookingController.createBooking
);

// self booking
router.get("/my-bookings", bookingController.getMyBookings);

// Admin - can see all booking
router.get(
  "/",
  authController.restrictTo("admin"),
  bookingController.getAllBookings
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  bookingController.deleteBookingById
);

module.exports = router;
