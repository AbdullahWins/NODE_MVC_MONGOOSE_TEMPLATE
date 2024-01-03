// Controllers/adServiceController.js
const AdService = require("../models/AdServiceModel");
const { logger } = require("../services/loggers/Winston");

//get single adService
const getAdService = async (req, res) => {
  try {
    const adService = await AdService.getAdService();
    if (!adService) {
      return res.status(404).send({ message: "adService not found" });
    } else {
      logger.log("info", JSON.stringify(adService, null, 2));
      return res.send(adService);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server Error" });
  }
};

//toggle adService
const toggleAdService = async (req, res) => {
  const data = JSON.parse(req?.body?.data) || {};
  logger.log("info", JSON.stringify(data, null, 2));
  if (!data) {
    return res.status(400).send({ message: "No input found!" });
  }
  const { isActive } = data;
  try {
    const adServiceData = {
      isActive,
    };
    const adService = await AdService.createOrUpdateAdService(adServiceData);
    if (!adService) {
      return res.status(500).send({ message: "Failed to add adService" });
    }
    return res.status(200).send({ message: "AdService added successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Failed to add adService" });
  }
};
//add new adService
const addOrUpdateAdService = async (req, res) => {
  const data = JSON.parse(req?.body?.data) || {};
  logger.log("info", JSON.stringify(data, null, 2));
  if (!data) {
    return res.status(400).send({ message: "No input found!" });
  }
  const {
    isActive,
    primaryAdNetworkName,
    adMobApplicationId,
    adMobAppId,
    adMobInterstitialId,
    adMobBannerId,
    adMobNativeId,
    adMobRewardedId,
    appLovinApplicationId,
    appLovinAppId,
    appLovinSdkKey,
    appLovinInterstitialId,
    appLovinBannerId,
    appLovingNativeId,
    appLovinRewardedId,
  } = data;
  try {
    const adServiceData = {
      isActive,
      primaryAdNetworkName,
      adMobApplicationId,
      adMobAppId,
      adMobInterstitialId,
      adMobBannerId,
      adMobNativeId,
      adMobRewardedId,
      appLovinApplicationId,
      appLovinAppId,
      appLovinSdkKey,
      appLovinInterstitialId,
      appLovinBannerId,
      appLovingNativeId,
      appLovinRewardedId,
    };
    const adService = await AdService.createOrUpdateAdService(adServiceData);
    if (!adService) {
      return res.status(500).send({ message: "Failed to add adService" });
    }
    return res.status(200).send({ message: "AdService added successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Failed to add adService" });
  }
};

//delete one adService
const deleteAdService = async (req, res) => {
  try {
    const result = await AdService.deleteAdService();
    logger.log("info", JSON.stringify(result, null, 2));
    if (result?.deletedCount === 0) {
      logger.log("error", "No adService found");
      return res.send({ message: "No adService found" });
    } else {
      logger.log("info", "adService deleted successfully");
      return res.status(200).send({ message: "AdService has been deleted" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Failed to delete adService" });
  }
};

module.exports = {
  getAdService,
  toggleAdService,
  addOrUpdateAdService,
  deleteAdService,
};
