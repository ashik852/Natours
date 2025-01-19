const express = require("express");

const viewsController = require("../Controller/viewController");
const authcontroller = require("../Controller/autuController");
const router = express.Router();
// for  only test
// router.get("/", (req, res) => {
//   res.status(200).render("base", {
//     tour: "The Forest Hiker",
//     user: "jonas",
//   });
// });
router.use(authcontroller.isLoggeIn);
router.get("/", viewsController.getOverview);
router.get("/tour/:slug", viewsController.getTour);
router.get("/login", viewsController.getLoginFrom);
module.exports = router;
