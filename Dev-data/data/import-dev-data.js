const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("./../../models/tourModels");
const User = require("./../../models/userModel");
const Review = require("./../../models/reviewModel");
dotenv.config({ path: "./config.env" });
if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  console.log("databse or database password is not defined");
  process.exit(1);
}
const DV = process.env.DATABASE.replace(
  "<PASSWORD>",

  process.env.DATABASE_PASSWORD
);
mongoose.connect(DV).then(() => {
  console.log("DB connection successful!");
});
// READ JESON FILLE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);
// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data successfully loaded!");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data successfully deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
