// controllers/AdminController.js

const { ObjectId } = require("mongodb");
const { uploadMultipleFiles } = require("../services/uploaders/fileUploader");
const Admin = require("../models/AdminModel");
const { SendOTP } = require("../services/otp/SendOTP");
const { logger } = require("../services/loggers/Winston");
const { ValidatePasswordResetOTP } = require("../services/otp/ValidateOTP");
const {
  hashPassword,
  comparePasswords,
} = require("../services/encryptions/bcryptHandler");

//login using mongoose
const LoginAdmin = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { email, password } = data;
    const result = await Admin.login({ email, password });
    if (result?.error) {
      return res.status(401).json({ message: result?.error });
    } else {
      logger.log("info", `Admin logged in: ${email}`);
      return res.json(result);
    }
  } catch (error) {
    logger.log("error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//register using mongoose
const RegisterAdmin = async (req, res) => {
  try {
    const { email, password } = JSON.parse(req?.body?.data);
    const result = await Admin.register({ email, password });
    if (result?.error) {
      return res.status(401).json({ message: result?.error });
    } else {
      logger.log("info", `Admin registered: ${email}`);
      return res.status(201).json(result);
    }
  } catch (error) {
    logger.log("error", `Error creating admin: ${error?.message}`);
    return res.status(500).json({ error: error?.message });
  }
};

//get all admins using mongoose
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    logger.log("info", `Found ${admins.length} admins`);
    return res.json(admins);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get single admin using mongoose
const getOneAdmin = async (req, res) => {
  try {
    const adminId = req?.params?.id;

    //object id validation
    if (!ObjectId.isValid(adminId)) {
      logger.log("error", `Invalid ObjectId: ${adminId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //get admin using model
    const admin = await Admin.findOne({ _id: adminId });

    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    } else {
      logger.log("info", JSON.stringify(admin, null, 2));
      return res.send(admin);
    }
  } catch (err) {
    logger.log("error", err);
    return res.status(500).send({ message: "Server Error" });
  }
};

// update one admin using mongoose
const updateAdminById = async (req, res) => {
  try {
    const id = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(id)) {
      logger.log("error", `Invalid ObjectId: ${id}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    const { files } = req;
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    const { password, ...additionalData } = data;
    const folderName = "admins";
    let updateData = {};

    if (files?.length > 0) {
      const fileUrls = await uploadMultipleFiles(files, folderName);
      const fileUrl = fileUrls[0];
      updateData = { ...updateData, fileUrl };
    }

    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData = { ...updateData, password: hashedPassword };
    }

    if (Object.keys(additionalData).length > 0) {
      updateData = { ...updateData, ...additionalData };
    }
    logger.log("info", JSON.stringify(updateData, null, 2));
    const updatedAdmin = await Admin.findOneAndUpdate(
      { _id: id },
      {
        $set: updateData,
      },
      { new: true } // To return the updated document
    );

    return res.json({
      message: "Admin updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    logger.log("error", `Error updating admin: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// send password reset OTP to admin using mongoose
const sendPasswordResetOTP = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { email } = data;
    const result = await SendOTP({ email, Model: Admin });
    if (result?.error) {
      return res.status(401).send({ message: result?.error });
    } else {
      return res.status(200).send({ message: result?.message });
    }
  } catch (error) {
    logger.log("error", error?.message);
    return res.status(500).send({ message: "Failed to send OTP" });
  }
};

// validate OTP using mongoose
const validatePasswordResetOTP = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { otp, email } = data;
    const result = await ValidatePasswordResetOTP({ email, otp, Model: Admin });
    console.log(result);
    if (result?.error) {
      return res.status(401).send({ message: result?.error });
    } else {
      return res.status(200).send({ message: result?.message });
    }
  } catch (err) {
    logger.log("error", err);
    return res.status(500).send({ message: "Failed to reset admin password" });
  }
};

// update one admin password by email OTP using mongoose
const updateAdminPasswordByOTP = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { otp, email, newPassword } = data;

    const otpStatus = await ValidatePasswordResetOTP({
      email,
      otp,
      Model: Admin,
    });
    if (otpStatus?.error) {
      logger.log("error", otpStatus?.error);
      return res.status(401).send({ message: otpStatus?.error });
    }
    let updateData = {};
    const hashedPassword = await hashPassword(newPassword);
    updateData = { password: hashedPassword };

    //update password using model
    const result = await Admin.findOneAndUpdate(
      { email: email },
      {
        $set: updateData,
      },
      { new: true } // To return the updated document
    );
    logger.log("info", result);
    if (result?.modifiedCount === 0) {
      logger.log("info", `No modifications were made: ${email}`);
      return res.status(404).send({ message: "No modifications were made!" });
    } else {
      logger.log("info", `Password updated for admin: ${email}`);
      return res.send({ message: "Password updated successfully!" });
    }
  } catch (err) {
    logger.log("error", err);
    return res.status(500).send({ message: "Failed to reset admin password" });
  }
};

// update one admin password by OldPassword using mongoose
const updateAdminPasswordByOldPassword = async (req, res) => {
  try {
    const email = req?.params?.email;
    const data = JSON.parse(req?.body?.data);
    const admin = await Admin.findOne({ email: email });
    const { oldPassword, newPassword } = data;

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const passwordMatch = await comparePasswords({
      inputPassword: oldPassword,
      hashPassword: admin?.password,
    });
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const hashedPassword = await hashPassword(newPassword);

    const result = await Admin.findOneAndUpdate(
      { email: email },
      {
        $set: { password: hashedPassword },
      },
      { new: true } // To return the updated document
    );
    return res.send({ message: result });
  } catch (err) {
    logger.log("error", err);
    return res.status(500).send({ message: "Failed to update admin password" });
  }
};

// delete one admin by id using mongoose
const deleteAdminById = async (req, res) => {
  try {
    const id = req?.params?.id;
    //object id validation
    if (!ObjectId.isValid(id)) {
      logger.log("error", `Invalid ObjectId: ${id}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //delete using model
    const result = await Admin.deleteOne({ _id: id });
    if (result?.deletedCount === 0) {
      logger.log("error", `No admin found to delete with this id: ${id}`);
      return res.send({
        message: `No admin found to delete with this id: ${id} `,
      });
    } else {
      logger.log("info", `Admin deleted: ${id}`);
      return res.send({
        message: `Admin deleted successfully with id: ${id} `,
      });
    }
  } catch (err) {
    logger.log("error", err);
    return res.status(500).send({ message: "Failed to delete admin" });
  }
};

module.exports = {
  getOneAdmin,
  getAllAdmins,
  updateAdminById,
  sendPasswordResetOTP,
  validatePasswordResetOTP,
  updateAdminPasswordByOTP,
  RegisterAdmin,
  LoginAdmin,
  updateAdminPasswordByOldPassword,
  deleteAdminById,
};
