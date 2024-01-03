// Controllers/paymentPerDownloadController.js

const { Timekoto } = require("timekoto");
const AccessValidator = require("../services/validators/AccessValidator");
const PPDModel = require("../models/PaymentPerDownloadModel");
const { logger } = require("../services/loggers/Winston");

//get PPD using mongoose
const getPPD = async (req, res) => {
  try {
    const PPDId = 1;

    //perform query on database
    const PPD = await PPDModel.findOne({
      id: PPDId,
    });

    if (!PPD) {
      return res.status(404).send({ message: "PPD not found" });
    } else {
      logger.log("info", JSON.stringify(PPD, null, 2));
      return res.send(PPD);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server error" });
  }
};

//add PPD using mongoose
const addOrUpdatePPD = async (req, res) => {
  try {
    const { name, description, amount } = JSON.parse(req?.body?.data);
    if (!name || !description || !amount) {
      res.status(400).send({ message: "Missing required fields" });
    }
    const filter = { id: 1 };
    const newPPD = {
      name,
      description,
      amount,
      updatedAt: Timekoto(),
    };

    //update PPD
    const PPD = await PPDModel.findOne(filter);
    logger.log("info", JSON.stringify(PPD, null, 2));
    if (PPD) {
      const updateResult = await PPDModel.updateOne(filter, newPPD);
      if (updateResult?.modifiedCount === 0) {
        logger.log("error", "Failed to update PPD");
        return res.status(500).send({ message: "Failed to update PPD" });
      } else {
        return res.status(200).send({ newPPD });
      }
    } else {
      //add new PPD
      const addResult = await PPDModel.create(newPPD);
      if (addResult?.insertedCount === 0) {
        logger.log("error", "Failed to add PPD");
        return res.status(500).send({ message: "Failed to add PPD" });
      }
      logger.log("info", `Added a new PPD: ${JSON.stringify(newPPD, null, 2)}`);
      return res.status(201).send({ newPPD });
    }
  } catch (error) {
    logger.log("error", `Error: ${error}`);
    return res
      .status(500)
      .send({ message: "Failed to add a message to the PPD!" });
  }
};

//delete PPD using mongoose
const deletePPD = async (req, res) => {
  try {
    //to perform multiple filters at once
    const filter = {
      id: 1,
    };

    const result = await PPDModel.deleteOne(filter);

    if (result?.deletedCount === 0) {
      logger.log("error", "PPD doesn't exists:");
      return res.send({ message: "PPD doesn't exists!" });
    } else {
      logger.log("info", "PPD deleted");
      return res.status(200).send({
        message: `PPD deleted`,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Failed to delete PPD" });
  }
};

module.exports = { getPPD, addOrUpdatePPD, deletePPD };
