const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

const studentSchema = new mongoose.Schema({
  name: String,
  roll: String,
  class: String,
  gender: String,
  fileUrl: String,
  dateOfBirth: Number,
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
