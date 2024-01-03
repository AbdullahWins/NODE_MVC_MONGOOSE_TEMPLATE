const { logger } = require("../loggers/Winston");

const AccessValidator = (user, userId) => {
  if (user?.role !== "admin") {
    if (user?._doc?._id.toString() !== userId) {
      logger.log("info", user?._doc?._id.toString(), userId);
      logger.log(
        "info",
        "This user does not have access to perform this operation!"
      );
      return false;
    } else {
      logger.log("info", `${user?._doc?.email} is accessing the API!`);
      return true;
    }
  } else {
    logger.log("info", "Admin is accessing the API!");
    return true;
  }
};

module.exports = AccessValidator;
