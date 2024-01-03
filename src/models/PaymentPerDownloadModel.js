const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

const ppdSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "default",
  },
  description: {
    type: String,
    default: "default zero payment per download",
  },
  ppd: {
    type: Number,
    default: 0,
  },
  id: {
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

// Function to update ViewCounter of a user
ppdSchema.methods.modifyPPD = function (ppd) {
  this.ppd = ppd;
  return this.save();
};

const PPDModel = mongoose.model("Ppd", ppdSchema);

module.exports = PPDModel;
