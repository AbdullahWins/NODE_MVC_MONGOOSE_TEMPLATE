const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

const adServiceSchema = new mongoose.Schema({
  isActive: Boolean,
  primaryAdNetworkName: String,
  adMobApplicationId: String,
  adMobAppId: String,
  adMobInterstitialId: String,
  adMobBannerId: String,
  adMobNativeId: String,
  adMobRewardedId: String,
  appLovinApplicationId: String,
  appLovinAppId: String,
  appLovinSdkKey: String,
  appLovinInterstitialId: String,
  appLovinBannerId: String,
  appLovingNativeId: String,
  appLovinRewardedId: String,
  adServiceId: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

//create or update adService
adServiceSchema.statics.createOrUpdateAdService = async function (
  adServiceData
) {
  try {
    const updatedAdService = await this.findOneAndUpdate(
      //find by a unique identifier, e.g., adServiceId
      { adServiceId: 1 },
      adServiceData,
      //options: create a new document if it doesn't exist, and return the updated document
      { upsert: true, new: true }
    );

    return updatedAdService;
  } catch (error) {
    throw error;
  }
};

//create a new adService
adServiceSchema.statics.createAdService = async function (adServiceData) {
  try {
    const newAdService = new this(adServiceData);
    const savedAdService = await newAdService.save();
    return savedAdService;
  } catch (error) {
    throw error;
  }
};

//get all adService
adServiceSchema.statics.getAllAdServices = async function () {
  try {
    const adServices = await this.find();
    return adServices;
  } catch (error) {
    throw error;
  }
};

//get ad service
adServiceSchema.statics.getAdService = async function () {
  try {
    const adService = await this.findOne({ adServiceId: 1 });
    return adService;
  } catch (error) {
    throw error;
  }
};

//get single adService
adServiceSchema.statics.getAdServiceById = async function (adServiceId) {
  try {
    const adService = await this.findById(adServiceId);
    return adService;
  } catch (error) {
    throw error;
  }
};

//update adService
adServiceSchema.statics.updateAdServiceById = async function (
  adServiceId,
  updatedData
) {
  try {
    const updatedAdService = await this.findByIdAndUpdate(
      adServiceId,
      updatedData,
      //return the updated document
      { new: true }
    );
    return updatedAdService;
  } catch (error) {
    throw error;
  }
};

//delete adService
adServiceSchema.statics.deleteAdService = async function () {
  try {
    const deletedAdService = await this.findOneAndDelete({ adServiceId: 1 });
    return deletedAdService;
  } catch (error) {
    throw error;
  }
};

//delete ad service by id
adServiceSchema.statics.deleteAdServiceById = async function (adServiceId) {
  try {
    const deletedAdService = await this.findByIdAndRemove(adServiceId);
    return deletedAdService;
  } catch (error) {
    throw error;
  }
};

const AdService = mongoose.model("AdService", adServiceSchema);

module.exports = AdService;
