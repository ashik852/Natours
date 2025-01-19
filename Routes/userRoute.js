const express = require("express");
const userController = require("./../Controller/userController");
const router = express.Router();
const autuController = require("./../Controller/autuController");
router.post("/signup", autuController.signup);
router.post("/login", autuController.login);
router.get("/logout", autuController.logout);
router.post("/forgotPassword", autuController.forgotPassword);
router.patch("/resetPassword/:token", autuController.resetPassword);
// Protect all routes after this middleware
router.use(autuController.protect);
router.patch(
  "/updateMyPassword",

  autuController.updatePassword
);
router.get("/me", userController.getMe, userController.getuser);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);
router.use(autuController.restrictTo("admin"));
router
  .route("/")
  .get(userController.getalluser)
  .post(userController.createuser);

router
  .route("/:id")
  .get(userController.getuser)
  .patch(userController.updateuser)
  .delete(userController.deleteuser);
module.exports = router;
