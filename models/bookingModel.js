const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Booking must belong to a Tour"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a User"],
  },
  userName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide your phone number"],
    trim: true,
    match: [/^01[3-9]\d{8}$/, "Bangladeshi phone number must have 11 digits"],
  },
  // Optional, populate থেকে নিতে পারো

  people: {
    type: Number,
    required: [true, "Please specify number of people"],
    min: [1, "At least one person required"],
  },
  totalCost: Number, // auto calculate per person * people (middleware)
  address: {
    type: String,
    required: [true, "Please provide pickup address"],
  },
  pickupLocation: {
    type: String,
    required: [true, "Please specify pickup location"],
  },
  date: {
    type: Date,
    required: [true, "Please specify tour date"],
  },
  paid: {
    type: Boolean,
    default: false,
  },
  paymentId: String, // Payment reference (e.g. stripe id)
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware: Save করার আগে totalCost অটো হিসাব করবে
bookingSchema.pre("save", async function (next) {
  if (!this.isModified("people") && !this.isModified("tour")) return next();

  try {
    // Tour থেকে price per person নিয়ে আসা
    const Tour = mongoose.model("Tour");
    const tour = await Tour.findById(this.tour);
    if (!tour) throw new Error("Tour not found");

    this.totalCost = tour.price * this.people;
    next();
  } catch (err) {
    next(err);
  }
});

// Middleware: Query এর সময় userName অটো populate করা
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  }).populate({
    path: "tour",
    select: "name price",
  });
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
