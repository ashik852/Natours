const mongoose = require("mongoose");
const dotenv = require("dotenv");
// global synchronus global handeling
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHTEXEPTION ERROR..SHUT DOWN");
  console.log(err.name, err.message);

  process.exit(1);
});
const Tour = require("./models/tourModels");
dotenv.config({ path: "./config.env" });
if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  console.log("databse or database password is not defined");
  process.exit(1);
}

const DV = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DV, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful!");
  });

// testTour = new Tour({})
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("ERROR🧨:", err);
//   });
const app = require("./app");
const { ServerApiVersion } = require("mongodb");
// console.log(process.env);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App runing on port ${port} `);
});
if (process.env.NODE_ENV === "production") {
  console.log("Running in production mode");
} else {
  console.log("Not in production mode");
}
// for asynchronous handle
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION!  SHUT DOWN SERVER");
  server.close(() => {
    process.exit(1);
  });
});
