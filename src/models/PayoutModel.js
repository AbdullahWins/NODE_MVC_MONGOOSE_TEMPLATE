const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

const payoutSchema = new mongoose.Schema({
  userId: String,
  country: String,
  fullName: String,
  contact: String,
  address: String,
  bankName: String,
  bankAccountNumber: String,
  notes: String,
  payoutAmount: Number,
  payoutStatus: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Number,
    default: () => Timekoto(),
  },
});

// Function to update ViewCounter of a user
payoutSchema.methods.addViews = function () {
  this.totalViews += 1;
  return this.save();
};

// Function to update ViewCounter of a user
payoutSchema.methods.addDownloads = function () {
  this.totalDownloads += 1;
  return this.save();
};

const Payout = mongoose.model("Payout", payoutSchema);

module.exports = Payout;
