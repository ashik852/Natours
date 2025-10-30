const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimiter = require("express-rate-limit");
const AppError = require("./utilits/appError");
const errorhandeler = require("./Controller/errorcontroler");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const reviewRouter = require("./Routes/reviewRoute");
const tourRouter = require("./Routes/tourRoute");
const userRouter = require("./Routes/userRoute");
const viewRouter = require("./Routes/viewRouter");
const bookingRoutes = require("./Routes/bookingRoutes");
 const cors = require("cors");
// Global middleware

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// serving static file
app.use(express.static(path.join(__dirname, "public")));
// Set security http header

app.use(helmet());

// Development loggin
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors());

//  app.use(cors({
//   origin: ['http://localhost:5173', 'https://natours-3da0.onrender.com']
  
// }));

// Limit requests from same IP
const limiter = rateLimiter({
  max: 5000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP,Please try again in an hour",
});
app.use("/api", limiter);
// Body parser,reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
// Body parser ,reading data from body into req.body
app.use(mongoSanitize());
// Data sanitizetion against xss
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["duration", "price"],
  })
);
// csp policy remove kra hoise ...karon axios beboharer jonno
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

// serving static file
// app.use(express.static(`${__dirname}/public`));

// Test middle ware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
// app.get("/", (req, res) => {
//   res.send("Welcome to the Home Page!");
// });

//Route
app.use((req, res, next) => {
  console.log("Middleware executed for route:", req.originalUrl);
  next();
});
app.get("/", (req, res) => {
  res.send("Server is running!");
});
// app.get("/tour", (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "Tour route is working!",
//   });
// });
// app.use("/tour", tourRouter);

app.disable("etag");
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRoutes);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "faill",
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
  // -----alada----
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use("*", (req, res) => {
  res.status(404).send("This route is not defined!");
});
app.use(errorhandeler);
module.exports = app;
