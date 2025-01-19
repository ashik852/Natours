const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const User = require("./userModel");
// const Review = require("./riviewModel");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 character"],
      minlength: [10, "A tour must have more  or equal then 10 charecter"],
      // validate: [validator.isAlpha,"Tour name must only contain charecter"]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration "],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have tour size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a Difficult"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficult is either:easy,medium,difficult",
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this only Point to current doc on NEW  document creation
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price({value}) shoud be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have cover image"],
    },
    images: [String],
    created: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // class 150..11 section
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });
tourSchema.virtual("durationWeek").get(function () {
  return this.duration / 7;
});
// virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});
// DOCUMENT MIDDLEWARE:run before .save() and create()
tourSchema.pre("save", function () {
  this.slug = slugify(this.name, { lower: true });
});

// QUERY MIDDLEWARE
// tourSchema.pre(find, function (next)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
// addd a guide and admin
tourSchema.pre("save", async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});
// arekta model ke display kora
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangeA",
  });
  next();
});
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
