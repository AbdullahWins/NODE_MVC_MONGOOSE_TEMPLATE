// Controllers/PayoutController.js

const { ObjectId } = require("mongodb");
const AccessValidator = require("../services/validators/AccessValidator");
const Payout = require("../models/PayoutModel");
const User = require("../models/UserModel");
const { logger } = require("../services/loggers/Winston");

//get all payouts using mongoose
const getAllPayouts = async (req, res) => {
  try {
    //perform query on database
    const payouts = await Payout.find();
    if (payouts?.length === 0) {
      return res.send([]);
    }
    logger.log("info", `Found ${payouts.length} payouts`);
    return res.send(payouts);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get all pending payouts using mongoose
const getAllPendingPayouts = async (req, res) => {
  try {
    //perform query on database
    const filter = { payoutStatus: "pending" };
    const payouts = await Payout.find(filter);
    if (payouts?.length === 0) {
      return res.send([]);
    }
    logger.log("info", `Found ${payouts.length} payouts!`);
    return res.send(payouts);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get all approved payouts using mongoose
const getAllApprovedPayouts = async (req, res) => {
  try {
    //perform query on database
    const filter = { payoutStatus: "approved" };
    const payouts = await Payout.find(filter);
    if (payouts?.length === 0) {
      return res.send([]);
    }
    logger.log("info", `Found ${payouts.length} payouts`);
    return res.send(payouts);
  } catch (err) {
    logger.log("error", err?.message);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get single payout using mongoose
const getOnePayout = async (req, res) => {
  try {
    const payoutId = req?.params?.id;
    //object id validation
    if (!ObjectId.isValid(payoutId)) {
      logger.log("error", `Invalid ObjectId: ${payoutId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //perform query on database
    const payout = await Payout.findOne({
      _id: payoutId,
    });

    if (!payout) {
      return res.status(404).send({ message: "payout not found" });
    } else {
      logger.log("info", JSON.stringify(payout, null, 2));
      return res.send(payout);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server error" });
  }
};

//get payout By user using mongoose
const getPayoutsByUser = async (req, res) => {
  try {
    const userId = req?.params?.userId;

    //object id validation
    if (!ObjectId.isValid(userId)) {
      logger.log("error", `Invalid ObjectId: ${userId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //to perform single filter
    const filter = { userId: userId };

    //perform query on database
    const userPayouts = await Payout.find(filter).exec();
    if (!userPayouts) {
      return res.status(404).send({ message: "Payout not found on this type" });
    } else {
      return res.send(userPayouts);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server Error" });
  }
};

//add new payout using mongoose
const addOnePayout = async (req, res) => {
  try {
    const {
      userId,
      country,
      fullName,
      contact,
      address,
      bankName,
      bankAccountNumber,
      notes,
    } = JSON.parse(req?.body?.data);

    if (
      !userId ||
      !country ||
      !fullName ||
      !contact ||
      !address ||
      !bankName ||
      !bankAccountNumber ||
      !notes
    ) {
      return res.status(400).send({ message: "Missing required fields" });
    }
    //validate user authority from middleware
    const user = req.user;
    const hasAccess = AccessValidator(user, userId);
    if (!hasAccess) {
      return res.status(401).send({
        message: "This user does not have access to perform this operation!",
      });
    }
    const userIdFromMiddleware = user?._doc?._id;
    const payoutAmountFromMiddleware = user?._doc?.availableBalance;
    //new payout object
    const newPayout = {
      userId: userIdFromMiddleware,
      country,
      fullName,
      contact,
      address,
      bankName,
      bankAccountNumber,
      notes,
      payoutAmount: payoutAmountFromMiddleware,
    };
    //check if an active payout exists
    const activePayout = await Payout.findOne({
      userId: userIdFromMiddleware,
      payoutStatus: "pending",
    });
    if (activePayout) {
      return res
        .status(400)
        .send({ message: "You have an active payout request" });
    }
    //add new payout
    const result = await Payout.create(newPayout);
    if (result.insertedCount === 0) {
      logger.log("error", "Failed to add payout");
      return res.status(500).send({ message: "Failed to add payout" });
    }
    //update user iswithdrawing status
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: { isWithdrawing: true },
      },
      { new: true } // To return the updated document
    );
    logger.log("info", `updatedUser: ${JSON.stringify(updatedUser)}`);
    if (updatedUser?.modifiedCount === 0) {
      return res
        .status(500)
        .json({ error: "Changes are already in sync with database" });
    }
    logger.log("info", `Added a new payout: ${newPayout}`);
    return res.status(201).send({ ...newPayout, _id: result._id });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).send({ message: "Failed to add payout!" });
  }
};

// approve a payout using mongoose
const approveOnePayout = async (req, res) => {
  try {
    const payoutId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(payoutId)) {
      logger.log("error", `Invalid ObjectId: ${payoutId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    const payoutStatus = "approved";
    const filter = { _id: payoutId };
    const updatedData = {
      payoutStatus,
    };

    const payout = await Payout.findById(payoutId);
    if (!payout) {
      return res.status(404).json({ error: "payout not found" });
    }
    if (payout?.payoutStatus === "approved") {
      return res.status(404).json({ error: "payout already approved" });
    }

    //update user availableBalance, isWithdrawing and totalWithdrawn
    const user = await User.findById(payout?.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const availableBalance = 0;
    const downloadCounter = 0;
    const isWithdrawing = false;
    const totalWithdrawn = user?.totalWithdrawn + payout?.payoutAmount;

    const updatedUserData = {
      availableBalance,
      downloadCounter,
      isWithdrawing,
      totalWithdrawn,
    };

    const updateUserStatus = await User.findOneAndUpdate(
      { _id: user?._id },
      {
        $set: updatedUserData,
      },
      { new: true }
    );
    if (updateUserStatus?.modifiedCount === 0) {
      return res
        .status(500)
        .json({ error: "Changes are already in sync with database" });
    }

    const updateStatus = await Payout.updateOne(filter, updatedData);
    if (updateStatus?.modifiedCount === 0) {
      return res
        .status(500)
        .json({ error: "Changes are already in sync with database" });
    }
    return res.json({ message: "Payout approved!" });
  } catch (error) {
    console.error("Error updating payout:", error?.message);
    return res.status(500).send({ message: "Failed to update liked payout" });
  }
};

// cancel a payout using mongoose
const cancelOnePayout = async (req, res) => {
  try {
    const payoutId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(payoutId)) {
      logger.log("error", `Invalid ObjectId: ${payoutId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    const payoutStatus = "cancelled";
    const filter = { _id: payoutId };
    const updatedData = {
      payoutStatus,
    };

    const payout = await Payout.findById(payoutId);
    if (!payout) {
      return res.status(404).json({ error: "payout not found" });
    }
    if (payout?.payoutStatus === "cancelled") {
      return res.status(404).json({ error: "payout already cancelled" });
    }

    //update user availableBalance, isWithdrawing and totalWithdrawn
    const user = await User.findById(payout?.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUserData = {
      isWithdrawing: false,
    };

    await User.findOneAndUpdate(
      { _id: user?._id },
      {
        $set: updatedUserData,
      },
      { new: true }
    );

    const updateStatus = await Payout.updateOne(filter, updatedData);
    if (updateStatus?.modifiedCount === 0) {
      return res
        .status(500)
        .json({ error: "Changes are already in sync with database" });
    }
    return res.json({ message: "Payout cancelled!" });
  } catch (error) {
    console.error("Error updating payout:", error?.message);
    return res.status(500).send({ message: "Failed to update liked payout" });
  }
};

//delete one payout
const deleteOnePayoutById = async (req, res) => {
  try {
    const payoutId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(payoutId)) {
      logger.log("error", `Invalid ObjectId: ${payoutId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //to perform multiple filters at once
    const filter = {
      _id: payoutId,
    };

    const result = await Payout.deleteOne(filter);

    if (result?.deletedCount === 0) {
      logger.log("info", `No payout found with this id: ${payoutId}`);
      return res.send({ message: "No payout found with this id!" });
    } else {
      logger.log("info", `payout deleted with Id: ${payoutId}`);
      return res.status(200).send({
        message: `payout deleted including ${result?.deletedCount} messages!`,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Failed to delete payout" });
  }
};

module.exports = {
  getAllPayouts,
  getAllPendingPayouts,
  getAllApprovedPayouts,
  getOnePayout,
  getPayoutsByUser,
  addOnePayout,
  approveOnePayout,
  cancelOnePayout,
  deleteOnePayoutById,
};
