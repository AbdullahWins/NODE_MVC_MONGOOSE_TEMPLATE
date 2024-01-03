const router = require("express").Router();
const { authorizeAdmin } = require("../middlewares/AuthorizeAdmin");
const { authorizeUserOrAdmin } = require("../middlewares/AuthorizeUserOrAdmin");

const {
  getAllNotifications,
  getOneNotification,
  addOneNotification,
  deleteOneNotificationById,
} = require("../controllers/notificationController");

router.get("/notifications/all", authorizeAdmin, getAllNotifications);
router.get("/notifications/find/:id", authorizeAdmin, getOneNotification);
router.post("/notifications/add", authorizeUserOrAdmin, addOneNotification);
router.delete(
  "/notifications/delete/:id",
  authorizeAdmin,
  deleteOneNotificationById
);

module.exports = router;
