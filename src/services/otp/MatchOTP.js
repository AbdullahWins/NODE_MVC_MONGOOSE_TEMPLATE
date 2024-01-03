const { Timekoto } = require("timekoto");
const OTP = require("../../models/OtpModel");

const MatchOTP = async (email, otp) => {
  const savedOtp = await OTP.findOne({ email: email });
  if (savedOtp?.otp === otp) {
    if (savedOtp?.expiresAt > Timekoto()) {
      return { isMatch: true, message: "OTP matched!" };
    } else {
      return { isMatch: false, message: "OTP expired!" };
    }
  } else {
    return { isMatch: false, message: "OTP did not match!" };
  }
};

module.exports = { MatchOTP };
