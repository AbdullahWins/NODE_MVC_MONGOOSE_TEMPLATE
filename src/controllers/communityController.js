// Controllers/CommunityImageController.js

const { ObjectId } = require("mongodb");
const { Timekoto } = require("timekoto");
const Community = require("../models/CommunityModel");
const User = require("../models/UserModel");
const {
  uploadSingleFileUsingUrl,
} = require("../services/uploaders/fileUploaderUsingUrl");
const { logger } = require("../services/loggers/Winston");

//get all CommunityImage using mongoose
const getAllCommunityImages = async (req, res) => {
  try {
    //perform query on database
    const communityImages = await Community.find();
    if (communityImages?.length === 0) {
      return res.send([]);
    }
    logger.log("info", `Found ${communityImages?.length} communityImages`);
    return res.send(communityImages);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get single communityImage using mongoose
const getOneCommunityImage = async (req, res) => {
  try {
    const communityImageId = req?.params?.id;
    //object id validation
    if (!ObjectId.isValid(communityImageId)) {
      logger.log("error", `Invalid ObjectId: ${communityImageId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //perform query on database
    const communityImage = await Community.findOne({
      _id: communityImageId,
    });

    if (!communityImage) {
      return res.status(404).send({ message: "communityImage not found" });
    } else {
      logger.log("info", JSON.stringify(communityImage, null, 2));
      return res.send(communityImage);
    }
  } catch (err) {
    logger.log("error", err);
    return res.status(500).send({ message: "Server error" });
  }
};

//get active communityImages using mongoose
const getActiveCommunityImages = async (req, res) => {
  try {
    //to perform single filter
    const filter = { isActive: true };

    //perform query on database
    const communityImageDetails = await Community.find(filter).exec();
    if (!communityImageDetails) {
      res
        .status(404)
        .send({ message: "communityImage not found on this type" });
    } else {
      return res.send(communityImageDetails);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get pending communityImages using mongoose
const getPendingCommunityImages = async (req, res) => {
  try {
    //to perform single filter
    const filter = { isActive: false };

    //perform query on database
    const communityImageDetails = await Community.find(filter).exec();
    if (!communityImageDetails) {
      res
        .status(404)
        .send({ message: "communityImage not found on this type" });
    } else {
      return res.send(communityImageDetails);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get communityImage By user using mongoose
const getCommunityImagesByUser = async (req, res) => {
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
    const communityImageDetails = await Community.find(filter).exec();
    if (!communityImageDetails) {
      res
        .status(404)
        .send({ message: "communityImage not found on this type" });
    } else {
      return res.send(communityImageDetails);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server Error" });
  }
};

//add new communityImage using mongoose
const addOneCommunityImage = async (req, res) => {
  try {
    const { wallpaperName, wallpaperUrl } = JSON.parse(req?.body?.data);
    if (!wallpaperName || !wallpaperUrl) {
      res.status(400).send({ message: "Missing required fields" });
    }

    //validate user authority from middleware
    const user = req.user;
    if (!user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const { _id, name, email } = user?._doc;

    const folderName = "community";
    const fileUrl = await uploadSingleFileUsingUrl(wallpaperUrl, folderName);
    const newCommunityImage = {
      authorId: _id,
      authorName: name || "Anonymous",
      authorEmail: email,
      wallpaperName,
      wallpaperUrl: fileUrl,
      sentAt: Timekoto(),
    };

    //add new communityImage
    const result = await Community.create(newCommunityImage);
    if (result.insertedCount === 0) {
      logger.log("error", "Failed to add communityImage");
      return res.status(500).send({ message: "Failed to add communityImage" });
    }
    logger.log("info", `Added a new communityImage ${newCommunityImage}`);
    return res.status(201).send({ ...newCommunityImage, _id: result._id });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res
      .status(500)
      .send({ message: "Failed to add a message to the communityImage!" });
  }
};

// update One Community Image using mongoose
const updateOneCommunityImage = async (req, res) => {
  try {
    const communityImageId = req?.params?.id;
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    // Object ID validation
    if (!ObjectId.isValid(communityImageId)) {
      logger.log("error", `Invalid ObjectId: ${communityImageId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    const updatedData = { ...data };

    const updatedCommunityImage = await Community.findOneAndUpdate(
      { _id: communityImageId },
      {
        $set: updatedData,
      },
      { new: true } // To return the updated document
    );

    if (updatedCommunityImage === null) {
      return res.status(404).send({ message: "Community image not found" });
    }
    logger.log("info", `User Community Image: ${updatedCommunityImage}`);
    if (!updatedCommunityImage) {
      return res
        .status(500)
        .json({ error: "Failed to update Community image" });
    }
    return res.json({ success: true, updatedCommunityImage });
  } catch (error) {
    console.error("Error updating Community image:", error?.message);
    return res
      .status(500)
      .send({ message: "Failed to update Community image" });
  }
};
// update view counter using mongoose
const updateViewCounter = async (req, res) => {
  try {
    const communityImageId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(communityImageId)) {
      logger.log("error", `Invalid ObjectId: ${communityImageId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const communityImage = await Community.findById(communityImageId);
    if (!communityImage) {
      return res.status(404).json({ error: "CommunityImage not found" });
    }

    const updateStatus = await communityImage.addViews();
    logger.log("info", JSON.stringify(updateStatus, null, 2));
    if (!updateStatus) {
      return res.status(500).json({ error: "Failed to update view counter" });
    }
    return res.json({ success: true, communityImage });
  } catch (error) {
    console.error("Error updating communityImage:", error?.message);
    return res
      .status(500)
      .send({ message: "Failed to update liked communityImage" });
  }
};

// add download counter using mongoose
const addDownloadCounter = async (req, res) => {
  try {
    const communityImageId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(communityImageId)) {
      logger.log("error", `Invalid ObjectId: ${communityImageId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const communityImage = await Community.findById(communityImageId);
    if (!communityImage) {
      return res.status(404).json({ error: "CommunityImage not found" });
    }

    //validate user authority from middleware
    const userFromMiddleware = req.user;
    if (!userFromMiddleware) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const { _id } = userFromMiddleware?._doc;
    const updateImageStatus = await communityImage.addDownloadedUsers(_id);
    logger.log("info", `updateImageStatus ${updateImageStatus}`);
    if (!updateImageStatus) {
      return res
        .status(200)
        .json({ error: "This user is already in downloaders list" });
    }

    const authorId = communityImage?.authorId;
    const user = await User.findById(authorId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updateBalanceStatus = await user.addBalance();
    if (!updateBalanceStatus) {
      return res.status(500).json({ error: "Failed to update balance" });
    }

    return res.json({ success: true, communityImage });
  } catch (error) {
    console.error("Error updating communityImage:", error?.message);
    return res
      .status(500)
      .send({ message: "Failed to update communityImage downloads" });
  }
};
// remove download counter using mongoose
const removeDownloadCounter = async (req, res) => {
  try {
    const communityImageId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(communityImageId)) {
      logger.log("error", `Invalid ObjectId: ${communityImageId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const communityImage = await Community.findById(communityImageId);
    if (!communityImage) {
      return res.status(404).json({ error: "CommunityImage not found" });
    }

    //validate user authority from middleware
    const userFromMiddleware = req.user;
    if (!userFromMiddleware) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const { _id } = userFromMiddleware?._doc;
    const updateImageStatus = await communityImage.removeDownloadedUsers(_id);
    if (!updateImageStatus) {
      return res
        .status(500)
        .json({ error: "Failed to update download counter" });
    }

    const authorId = communityImage?.authorId;
    const user = await User.findById(authorId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updateBalanceStatus = await user.addBalance();
    if (!updateBalanceStatus) {
      return res.status(500).json({ error: "Failed to update balance" });
    }

    return res.json({ success: true, communityImage });
  } catch (error) {
    console.error("Error updating communityImage:", error?.message);
    return res
      .status(500)
      .send({ message: "Failed to update liked communityImage" });
  }
};

//delete one communityImage
const deleteOneCommunityImageById = async (req, res) => {
  try {
    const communityImageId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(communityImageId)) {
      logger.log("error", `Invalid ObjectId: ${communityImageId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //to perform multiple filters at once
    const filter = {
      _id: communityImageId,
    };

    const result = await Community.deleteOne(filter);

    if (result?.deletedCount === 0) {
      logger.log(
        "error",
        `No communityImage found with this id: ${communityImageId}`
      );
      return res.send({ message: "No communityImage found with this id!" });
    } else {
      logger.log("info", `communityImage deleted with Id: ${communityImageId}`);
      return res.status(200).send({
        message: `communityImage deleted including ${result?.deletedCount} messages!`,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Failed to delete communityImage" });
  }
};

module.exports = {
  getAllCommunityImages,
  getOneCommunityImage,
  getActiveCommunityImages,
  getPendingCommunityImages,
  getCommunityImagesByUser,
  addOneCommunityImage,
  updateOneCommunityImage,
  updateViewCounter,
  addDownloadCounter,
  removeDownloadCounter,
  deleteOneCommunityImageById,
};
