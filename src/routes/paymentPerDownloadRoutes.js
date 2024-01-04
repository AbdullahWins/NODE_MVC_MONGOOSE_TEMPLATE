const router = require("express").Router();
const {
  getPPD,
  addOrUpdatePPD,
  deletePPD,
} = require("../controllers/paymentPerDownloadController");
const { authorizeAdmin } = require("../middlewares/AuthorizeAdmin");

router.get("/ppd/get", authorizeAdmin, getPPD);
router.post("/ppd/add", authorizeAdmin, addOrUpdatePPD);
router.delete("/ppd/delete", authorizeAdmin, deletePPD);

module.exports = router;
