const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

const otpSchema = new mongoose.Schema({
  email: String,
  otp: Number,
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
  expiresAt: {
    type: Number,
    default: () => Timekoto() + 60 * 3, // 3 mins in seconds
  },
});

const OTP = mongoose.model("Otp", otpSchema);

module.exports = OTP;
