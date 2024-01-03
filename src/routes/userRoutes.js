// routes/userRoutes.js
const router = require("express").Router();
const {
  getOneUser,
  getAllUsers,
  updateUserById,
  addOneLike,
  addOneWallpaperToMyWallpapers,
  removeOneWallpaperToMyWallpapers,
  sendPasswordResetOTP,
  validateUserPasswordByOTP,
  updateUserPasswordByOTP,
  RegisterUser,
  LoginUser,
  updateUserPasswordByOldPassword,
  deleteUserById,
} = require("../controllers/userController");
const { authorizeAdmin } = require("../middlewares/AuthorizeAdmin");
const { authorizeUserOrAdmin } = require("../middlewares/AuthorizeUserOrAdmin");

router.get("/users/find/:id", authorizeUserOrAdmin, getOneUser);
router.get("/users/all", authorizeAdmin, getAllUsers);
router.post("/users/login", LoginUser);
router.post("/users/register", RegisterUser);
router.post("/users/send-otp", sendPasswordResetOTP);
router.post("/users/validate-otp", validateUserPasswordByOTP);
router.patch("/users/reset", updateUserPasswordByOTP);
router.patch("/users/update/:id", authorizeUserOrAdmin, updateUserById);
router.patch("/users/toggle-like/:id", authorizeUserOrAdmin, addOneLike);
router.patch(
  "/users/add-my-wallpaper/:id",
  authorizeUserOrAdmin,
  addOneWallpaperToMyWallpapers
);
router.patch(
  "/users/remove-my-wallpaper/:id",
  authorizeUserOrAdmin,
  removeOneWallpaperToMyWallpapers
);
router.patch("/users/resetpassword/:email", updateUserPasswordByOldPassword);
router.delete("/users/delete/:id", authorizeUserOrAdmin, deleteUserById);

module.exports = router;
