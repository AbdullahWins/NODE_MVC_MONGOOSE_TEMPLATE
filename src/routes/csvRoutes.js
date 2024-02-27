const router = require("express").Router();
const {
  addStudentsInBulkFromCsvFile,
} = require("../controllers/csvController");

router.post("/csv/add", addStudentsInBulkFromCsvFile);

module.exports = router;
