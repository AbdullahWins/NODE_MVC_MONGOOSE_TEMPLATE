const router = require("express").Router();
const { authorizeAdmin } = require("../middlewares/AuthorizeAdmin");

const {
  getOneAdmin,
  getAllAdmins,
  LoginAdmin,
  RegisterAdmin,
  updateAdminById,
  sendPasswordResetOTP,
  validatePasswordResetOTP,
  updateAdminPasswordByOTP,
  updateAdminPasswordByOldPassword,
  deleteAdminById,
} = require("../controllers/adminController");

router.get("/admins/find/:id", authorizeAdmin, getOneAdmin);
router.get("/admins/all", authorizeAdmin, getAllAdmins);
router.post("/admins/register", RegisterAdmin);
router.post("/admins/login", LoginAdmin);
router.post("/admins/send-otp", sendPasswordResetOTP);
router.post("/admins/validate-otp", validatePasswordResetOTP);
router.patch("/admins/reset", updateAdminPasswordByOTP);
router.patch("/admins/update/:id", authorizeAdmin, updateAdminById);
router.patch("/admins/resetpassword/:email", updateAdminPasswordByOldPassword);
router.delete("/admins/delete/:id", authorizeAdmin, deleteAdminById);

module.exports = router;
