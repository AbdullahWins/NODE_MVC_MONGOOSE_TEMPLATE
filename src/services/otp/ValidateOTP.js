const { MatchOTP } = require("./MatchOTP");

const ValidatePasswordResetOTP = async ({ email, otp, Model }) => {
  try {
    //validate inputs
    if (!otp || !email) {
      return { error: "All fields are required" };
    }
    //check if the admin already exists
    const user = await Model.findOne({ email });
    if (!user) {
      return { error: `${Model.modelName} not found` };
    }
    //match the otp
    const otpMatch = await MatchOTP(email, otp);
    if (!otpMatch?.isMatch) {
      return { error: otpMatch?.message };
    } else {
      return { message: otpMatch?.message };
    }
  } catch (error) {
    console.error(error?.message);
    return { message: `Failed to reset ${Model.modelName} password` };
  }
};

exports.ValidatePasswordResetOTP = ValidatePasswordResetOTP;
