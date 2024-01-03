const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  image: String,
  recipients: [String],
  createdAt: {
    type: Number,
    default: () => Timekoto(),
  },
});

// Function to update ViewCounter of a user
notificationSchema.methods.addViews = function () {
  this.totalViews += 1;
  return this.save();
};

// Function to update ViewCounter of a user
notificationSchema.methods.addDownloads = function () {
  this.totalDownloads += 1;
  return this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
