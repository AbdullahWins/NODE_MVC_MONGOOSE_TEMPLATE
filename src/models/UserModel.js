const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const PPDModel = require("./PaymentPerDownloadModel");
const { logger } = require("../services/loggers/Winston");

//get the payment rate per download
const paymentDoc = async () => {
  const doc = await PPDModel.findOne({ id: 1 });
  const payment = doc?.ppd || 0.001;
  return payment;
};

const userSchema = new mongoose.Schema({
  email: String,
  phone: String,
  countryCode: String,
  name: String,
  gender: String,
  fileUrl: String,
  password: String,
  dateOfBirth: Number,
  oneSignalId: String,
  remainingCoins: {
    type: Number,
    default: 499,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  downloadCounter: {
    type: Number,
    default: 0,
  },
  isWithdrawing: {
    type: Boolean,
    default: false,
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
  likedWallpapers: {
    type: [String],
    default: [],
  },
  myWallpapers: {
    type: [String],
    default: [],
  },
});

// Function to add myWallpapers of a user
userSchema.methods.addMyWallpapers = async function (fileUrls) {
  const existingUrls = new Set(this.myWallpapers);
  const uniqueNewUrls = fileUrls.filter((url) => !existingUrls.has(url));

  if (uniqueNewUrls.length > 0) {
    logger.log("info", "Adding");
    this.myWallpapers = this.myWallpapers.concat(uniqueNewUrls);
  } else {
    logger.log("info", "No change");
    return Promise.resolve(this);
  }

  return this.save();
};

// Function to remove myWallpapers of a user
userSchema.methods.removeMyWallpapers = function (wallpaperUrls) {
  const urlsToRemoveArray = wallpaperUrls || [];

  const urlsToRemoveSet = new Set(urlsToRemoveArray);
  this.myWallpapers = this.myWallpapers.filter(
    (wp) => !urlsToRemoveSet.has(wp)
  );

  if (urlsToRemoveSet.size > 0) {
    logger.log("info", "Removing");
  } else {
    logger.log("info", "No change");
    return Promise.resolve(this);
  }

  return this.save();
};

// Function to update likedWallpapers of a user
userSchema.methods.toggleLike = function (wallpaperId, actionType) {
  const isLiked = this.likedWallpapers.includes(wallpaperId);

  if (actionType === true && !isLiked) {
    logger.log("info", "Adding");
    this.likedWallpapers.push(wallpaperId);
  } else if (actionType === false && isLiked) {
    logger.log("info", "Removing");
    this.likedWallpapers = this.likedWallpapers.filter(
      (id) => id !== wallpaperId
    );
  } else {
    logger.log("info", "No change");
    return Promise.resolve(this);
  }
  return this.save();
};

// Function to update withdraw status to prevent multiple withdraw requests at once
userSchema.methods.toggleWithdrawStatus = async function () {
  this.isWithdrawing = !this.isWithdrawing;
  return this.save();
};

// Function to add balance to a user upon download
userSchema.methods.addBalance = async function () {
  const ppd = await paymentDoc();
  this.availableBalance = this.availableBalance + ppd;
  this.downloadCounter = this.downloadCounter + 1;
  return this.save();
};

// Function to remove balance to a user upon withdrawal
userSchema.methods.removeBalance = async function () {
  this.totalWithdrawn = this.totalWithdrawn + this.availableBalance;
  this.availableBalance = 0;
  this.downloadCounter = 0;
  return this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
