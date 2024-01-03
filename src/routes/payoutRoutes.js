const router = require("express").Router();
const { authorizeAdmin } = require("../middlewares/AuthorizeAdmin");
const { authorizeUserOrAdmin } = require("../middlewares/AuthorizeUserOrAdmin");

const {
  getAllPayouts,
  getAllPendingPayouts,
  getAllApprovedPayouts,
  getOnePayout,
  getPayoutsByUser,
  addOnePayout,
  approveOnePayout,
  cancelOnePayout,
  deleteOnePayoutById,
} = require("../controllers/payoutController");

router.get("/payouts/all", authorizeAdmin, getAllPayouts);
router.get("/payouts/pending", authorizeAdmin, getAllPendingPayouts);
router.get("/payouts/approved", authorizeAdmin, getAllApprovedPayouts);
router.get("/payouts/find/:id", authorizeAdmin, getOnePayout);
router.get("/payouts/user/:userId", authorizeAdmin, getPayoutsByUser);
router.post("/payouts/add", authorizeUserOrAdmin, addOnePayout);
router.patch("/payouts/approve/:id", authorizeAdmin, approveOnePayout);
router.patch("/payouts/cancel/:id", authorizeAdmin, cancelOnePayout);
router.delete("/payouts/delete/:id", authorizeAdmin, deleteOnePayoutById);

module.exports = router;
