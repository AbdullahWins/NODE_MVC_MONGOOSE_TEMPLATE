//delete all the user related data from the database
const User = require("../../models/UserModel");
const Community = require("../../models/CommunityModel");
const Payout = require("../../models/PayoutModel");
const { logger } = require("../loggers/Winston");

const UserCleanup = async (userId) => {
  try {
    const userDeletion = await User.deleteOne({ _id: userId });
    const userContributionDeletion = await Community.deleteMany({
      authorId: userId,
    });
    const userPayoutDeletion = await Payout.deleteMany({ userId });
    logger.log(
      "info",
      `User ${userId} deleted successfully with ${userContributionDeletion?.deletedCount} user contribution deletion and ${userPayoutDeletion?.deletedCount} user payout deletion`
    );
    return true;
  } catch (error) {
    logger.log("error", error?.message);
    return false;
  }
};

exports.UserCleanup = UserCleanup;
