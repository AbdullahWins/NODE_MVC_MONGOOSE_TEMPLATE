const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

const adminSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  fileUrl: String,
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
