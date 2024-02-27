// Controllers/StudentsController.js

const Student = require("../models/StudentModel");

const fs = require("fs");

const addStudentsInBulkFromCsvFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No files were uploaded." });
    }

    const file = req.files[0]; // Assuming only one file is uploaded
    const filePath = `uploads/${file.filename}`; // Constructing the file path
    console.log(filePath);

    // Read the file from disk
    const csvString = fs.readFileSync(filePath, "utf8");

    if (!csvString) {
      return res
        .status(400)
        .send({ message: "No data found in the uploaded file." });
    }

    const csvArray = csvString.split("\n");

    const students = [];

    for (let i = 0; i < csvArray.length; i++) {
      const studentData = csvArray[i].split(",");
      const studentObject = {
        name: studentData[0],
        roll: studentData[1],
        class: studentData[2],
      };
      students.push(studentObject);
    }

    const studentsAdded = await Student.insertMany(students);
    console.log(studentsAdded);
    return res.status(200).send({
      message: "Students added successfully",
      count: studentsAdded.length,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).send({ message: "Failed to add students!" });
  }
};

module.exports = {
  addStudentsInBulkFromCsvFile,
};
