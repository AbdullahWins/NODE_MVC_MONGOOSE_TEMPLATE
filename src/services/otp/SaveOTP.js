const { Timekoto } = require("timekoto");
const OTP = require("../../models/OtpModel");

const SaveOTP = async (email, otp) => {
  const existingOtp = await OTP.findOne({ email });
  if (existingOtp) {
    const expiresAt = Timekoto() + 60 * 3; // 3 mins in seconds
    const updatedOtp = await OTP.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { new: true }
    );
    return updatedOtp;
  } else {
    const newOtp = await OTP.create({ email, otp });
    return newOtp;
  }
};

module.exports = { SaveOTP };
