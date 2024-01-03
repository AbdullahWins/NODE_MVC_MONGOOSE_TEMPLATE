const router = require("express").Router();
const { authorizeAdmin } = require("../middlewares/AuthorizeAdmin");

const {
  getAdService,
  toggleAdService,
  addOrUpdateAdService,
  deleteAdService,
} = require("../controllers/adServiceController");

router.get("/adservices/find", authorizeAdmin, getAdService);
router.post("/adservices/toggle", authorizeAdmin, toggleAdService);
router.post("/adservices/add", authorizeAdmin, addOrUpdateAdService);
router.delete("/adservices/delete", authorizeAdmin, deleteAdService);

module.exports = router;
