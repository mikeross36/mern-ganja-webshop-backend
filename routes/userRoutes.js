const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/register-user", authController.registerUser);
router.post("/login-user", authController.loginUser);
router.post("/logout-user", authController.logoutUser);

router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

router.use(authController.tokenProtect);

router.get(
  "/user-profile",
  userController.getUserProfile,
  userController.getUser
);
router.patch(
  "/update-user-account",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateUserAccount
);
router.patch("/update-password", authController.updatePassword);

router.use(authController.restrictTo("admin"));
router.route("/").get(userController.getAllUsers);

router
  .route("/:userId")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
