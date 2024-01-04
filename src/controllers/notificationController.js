// Controllers/NotificationController.js

const AccessValidator = require("../services/validators/AccessValidator");
const Notification = require("../models/NotificationModel");
const { uploadMultipleFiles } = require("../services/uploaders/fileUploader");
const { logger } = require("../services/loggers/Winston");

//get all Notifications using mongoose
const getAllNotifications = async (req, res) => {
  try {
    //perform query on database
    const notifications = await Notification.find();
    if (notifications?.length === 0) {
      return res.send([]);
    }
    logger.log("info", `Found ${notifications?.length} notifications`);
    return res.send(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get single notification using mongoose
const getOneNotification = async (req, res) => {
  try {
    const notificationId = req?.params?.id;
    //object id validation
    if (!ValidObjectId(notificationId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //perform query on database
    const notification = await Notification.findOne({
      _id: notificationId,
    });

    if (!notification) {
      return res.status(404).send({ message: "notification not found" });
    } else {
      logger.log("info", JSON.stringify(notification, null, 2));
      return res.send(notification);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server error" });
  }
};

//add new notification using mongoose
const addOneNotification = async (req, res) => {
  try {
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    const { adminId, title, message, recipients } = data;
    const { files } = req;
    const folderName = "notifications";
    if (!title || !adminId || !message || !recipients) {
      return res.status(400).send({ message: "Missing required fields" });
    }
    //validate user authority from middleware
    const user = req.user;
    const hasAccess = AccessValidator(user, adminId);
    if (!hasAccess) {
      return res.status(401).send({
        message: "This user does not have access to perform this operation!",
      });
    }
    //new notification object
    let newNotification = {
      title,
      message,
      recipients,
    };
    //upload the file if exists
    if (files?.length > 0) {
      const fileUrls = await uploadMultipleFiles(files, folderName);
      const fileUrl = fileUrls[0];
      newNotification = { ...newNotification, image: fileUrl };
    }
    //add new notification
    const result = await Notification.create(newNotification);
    if (result.insertedCount === 0) {
      logger.log("error", "Failed to add notification");
      return res.status(500).send({ message: "Failed to add notification" });
    } else {
      logger.log("info", "notification added successfully");
      return res.status(200).send({
        message: "notification added successfully",
        data: result,
      });
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).send({ message: "Failed to add notification!" });
  }
};

//delete one notification
const deleteOneNotificationById = async (req, res) => {
  try {
    const notificationId = req?.params?.id;
    //object id validation
    if (!ValidObjectId(notificationId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //to perform multiple filters at once
    const filter = {
      _id: notificationId,
    };

    const result = await Notification.deleteOne(filter);

    logger.log("info", JSON.stringify(filter, null, 2));

    if (result?.deletedCount === 0) {
      logger.log(
        "error",
        `No notification found with this id: ${notificationId}`
      );
      return res.send({ message: "No notification found with this id!" });
    } else {
      logger.log("info", `notification deleted with Id: ${notificationId}`);
      return res.status(200).send({
        message: `notification deleted including ${result?.deletedCount} messages!`,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Failed to delete notification" });
  }
};

module.exports = {
  getAllNotifications,
  getOneNotification,
  addOneNotification,
  deleteOneNotificationById,
};
