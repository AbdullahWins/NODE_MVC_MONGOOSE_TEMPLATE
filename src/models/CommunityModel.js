const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { logger } = require("../services/loggers/Winston");

const communitySchema = new mongoose.Schema({
  authorId: String,
  authorName: String,
  authorEmail: String,
  wallpaperName: String,
  wallpaperUrl: String,
  isActive: {
    type: Boolean,
    default: false,
  },
  totalViews: {
    type: Number,
    default: 0,
  },
  downloaders: {
    type: [String],
    default: [],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

// Function to update ViewCounter of a user
communitySchema.methods.addViews = function () {
  this.totalViews += 1;
  return this.save();
};

// Function to update ViewCounter of a user
communitySchema.methods.addDownloads = function () {
  this.totalDownloads += 1;
  return this.save();
};

// Function to add downloaders of a user
communitySchema.methods.addDownloadedUsers = function (userId) {
  // Check if userId already exists in myWallpapers array
  if (!this.downloaders?.includes(userId)) {
    logger.log("info", "Adding");
    // Add userId to downloaders array
    this.downloaders?.push(userId);
    this.save();
    return true;
  } else {
    logger.log("info", "No change");
    Promise.resolve(this);
    return false;
  }
};

// Function to remove downloaders of a user
communitySchema.methods.removeDownloadedUsers = function (userId) {
  // Check if userId exists in downloaders array
  const index = this.downloaders.indexOf(userId);
  if (index !== -1) {
    logger.log("info", "Removing");
    // Remove userId from downloaders array
    this.downloaders.splice(index, 1);
    this.save();
    return true;
  } else {
    logger.log("info", "No change");
    Promise.resolve(this);
    return false;
  }
};

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
