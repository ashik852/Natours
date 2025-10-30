const Booking = require("../models/bookingModel");

// ✅ Create Booking
exports.createBooking = async (req, res) => {
  console.log(req.body), console.log("tour id", req.params.tourId);
  console.log(req.user);
  try {
    const {
      people,
      address,
      phoneNumber,
      pickupLocation,
      date,
      paid,
      paymentId,
      email, // ✅ email নিতে হবে
    } = req.body;

    // ✅ Validate all fields including email
    if (
      !people ||
      !address ||
      !pickupLocation ||
      !date ||
      !email ||
      !phoneNumber
    ) {
      console.log("❌ Missing fields:", {
        people,
        address,
        pickupLocation,
        date,
        email,
      });
      return res.status(400).json({
        status: "fail",
        message: "Please provide all required fields",
      });
    }

    const booking = await Booking.create({
      tour: req.params.tourId,
      user: req.user.id,
      userName: req.user.name, // ✅ Username save
      email, // ✅ save email
      people,
      phoneNumber,
      address,
      pickupLocation,
      date,
      paid: paid || false,
      paymentId: paymentId || null,
    });

    res.status(201).json({
      status: "success",
      data: {
        booking,
      },
    });
  } catch (err) {
    console.error("🔥 Booking Error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }
};

// ✅ Get bookings of logged-in user
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort(
      "-createdAt"
    );

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: { bookings },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ✅ Admin: Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: { bookings },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
// controllers/bookingController.js

// const Booking = require("../models/bookingModel");

exports.deleteBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(204).json(); //  nothing send any data
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting booking" });
  }
};
