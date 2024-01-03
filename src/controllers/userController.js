// controllers/userController.js

const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const { SendEmail } = require("../services/emails/SendEmail");
const { uploadMultipleFiles } = require("../services/uploaders/fileUploader");
const { InitiateToken } = require("../services/tokens/InitiateToken");
const User = require("../models/UserModel");
const { CreateOTP } = require("../services/otp/CreateOTP");
const { SaveOTP } = require("../services/otp/SaveOTP");
const { MatchOTP } = require("../services/otp/MatchOTP");
const AccessValidator = require("../services/validators/AccessValidator");
const {
  uploadMultipleFilesUsingUrls,
} = require("../services/uploaders/fileUploaderUsingUrl");
const { UserCleanup } = require("../services/userCleanup/UserCleanup");
const { logger } = require("../services/loggers/Winston");

//login using mongoose
const LoginUser = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { email, password, oneSignalId } = data;
    if ((!email || !password, !oneSignalId)) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email: email }).exec();
    logger.log("info", JSON.stringify(user, null, 2));
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user?.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    //update one signal id to the user
    const updatedResult = await User.findOneAndUpdate(
      { email: email },
      {
        $set: { oneSignalId },
      },
      { new: true }
    );
    if (updatedResult === null) {
      return res.status(404).send({ message: "User not found" });
    }
    logger.log("info", `User updated: ${updatedResult}`);
    const token = InitiateToken(user?._id, 30);
    return res.json({ token, user: updatedResult });
  } catch (error) {
    logger.log("error", error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//register using mongoose
const RegisterUser = async (req, res) => {
  try {
    const { email, password, oneSignalId } = JSON.parse(req?.body?.data);

    // Check if the required fields are present in the request
    if (!email || !password || !oneSignalId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUserCheck = await User.findOne({ email: email }).exec();
    if (existingUserCheck) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      email,
      password: hashedPassword,
      oneSignalId,
    });

    // Save the user to the database
    await newUser.save();
    //generate token
    const token = InitiateToken(newUser?._id, 30);

    return res
      .status(201)
      .json({ message: "User created successfully", token, user: newUser });
  } catch (error) {
    logger.log("error", `Error creating user: ${error?.message}`);
    return res.status(500).json({ error: error.message });
  }
};

//get all users using mongoose
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    logger.log("info", `Found ${users?.length} users`);
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get single user using mongoose
const getOneUser = async (req, res) => {
  try {
    const userId = req?.params?.id;

    //object id validation
    if (!ObjectId.isValid(userId)) {
      logger.log("error", `Invalid ObjectId: ${userId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const userFromMiddleware = req?.user;
    logger.log("info", `${JSON.stringify(userFromMiddleware)}`);
    const hasAccess = AccessValidator(userFromMiddleware, userId);
    logger.log("info", hasAccess);
    if (!hasAccess) {
      return res.status(401).send({
        message: "This user does not have access to perform this operation!",
      });
    }

    //get user using model
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    } else {
      logger.log("info", JSON.stringify(user));
      return res.send(user);
    }
  } catch (err) {
    logger.log("error", err?.message);
    return res.status(500).send({ message: "Server Error" });
  }
};

// update one user using mongoose
const addOneLike = async (req, res) => {
  try {
    const userId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(userId)) {
      logger.log("error", `Invalid ObjectId: ${userId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const userFromMiddleware = req?.user;
    logger.log("info", JSON.stringify(userFromMiddleware, null, 2));
    const hasAccess = AccessValidator(userFromMiddleware, userId);
    logger.log("info", hasAccess);
    if (!hasAccess) {
      return res.status(401).send({
        message: "This user does not have access to perform this operation!",
      });
    }

    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    const { wallpaperId, actionType } = data;
    logger.log("info", `${wallpaperId}, ${actionType}`);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.toggleLike(wallpaperId, actionType);
    return res.json({ success: true, user });
  } catch (error) {
    logger.log("error", `Error updating user: ${error?.message}`);
    return res
      .status(500)
      .send({ message: "Failed to update liked wallpapers" });
  }
};

// update one wallpaper to user generated wallpapers using mongoose
const addOneWallpaperToMyWallpapers = async (req, res) => {
  try {
    const userId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(userId)) {
      logger.log("error", `Invalid ObjectId: ${userId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const userFromMiddleware = req?.user;
    logger.log("info", JSON.stringify(userFromMiddleware, null, 2));
    const hasAccess = AccessValidator(userFromMiddleware, userId);
    logger.log("info", hasAccess);
    if (!hasAccess) {
      return res.status(401).send({
        message: "This user does not have access to perform this operation!",
      });
    }

    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    const { wallpaperUrls } = data;
    const fileUrls = await uploadMultipleFilesUsingUrls(
      wallpaperUrls,
      "wallpapers"
    );
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.addMyWallpapers(fileUrls);
    return res.json({ success: true, user });
  } catch (error) {
    logger.log("error", `Error updating user: ${error?.message}`);
    return res.status(500).send({ message: "Failed to add my wallpapers" });
  }
};

// remove one wallpaper to user generated wallpapers using mongoose
const removeOneWallpaperToMyWallpapers = async (req, res) => {
  try {
    const userId = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(userId)) {
      logger.log("error", `Invalid ObjectId: ${userId}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const userFromMiddleware = req?.user;
    logger.log("info", JSON.stringify(userFromMiddleware, null, 2));
    const hasAccess = AccessValidator(userFromMiddleware, userId);
    logger.log("info", hasAccess);
    if (!hasAccess) {
      return res.status(401).send({
        message: "This user does not have access to perform this operation!",
      });
    }

    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    const { wallpaperUrls } = data;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    logger.log("info", JSON.stringify(wallpaperUrls, null, 2));
    await user.removeMyWallpapers(wallpaperUrls);
    return res.json({ success: true, user });
  } catch (error) {
    logger.log("error", `Error updating user: ${error?.message}`);
    return res.status(500).send({ message: "Failed to remove my wallpapers" });
  }
};

// update one user using mongoose
const updateUserById = async (req, res) => {
  try {
    const id = req?.params?.id;
    // Object ID validation
    if (!ObjectId.isValid(id)) {
      logger.log("error", `Invalid ObjectId: ${id}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const userFromMiddleware = req?.user;
    logger.log("info", JSON.stringify(userFromMiddleware, null, 2));
    const hasAccess = AccessValidator(userFromMiddleware, id);
    logger.log("info", hasAccess);
    if (!hasAccess) {
      return res.status(401).send({
        message: "This user does not have access to perform this operation!",
      });
    }

    const { files } = req;
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    const { password, ...additionalData } = data;
    const folderName = "users";
    let updateData = {};

    if (files?.length > 0) {
      const fileUrls = await uploadMultipleFiles(files, folderName);
      const fileUrl = fileUrls[0];
      updateData = { ...updateData, fileUrl };
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData = { ...updateData, password: hashedPassword };
    }

    if (Object.keys(additionalData).length > 0) {
      updateData = { ...updateData, ...additionalData };
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: updateData,
      },
      { new: true } // To return the updated document
    );

    if (updatedUser === null) {
      return res.status(404).send({ message: "User not found" });
    }
    logger.log("info", `User updated: ${updatedUser}`);

    return res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    logger.log("error", `Error updating user: ${error?.message}`);
    return res.status(500).send({ message: "Failed to update user" });
  }
};

// send password reset OTP to user using mongoose
const sendPasswordResetOTP = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { email } = data;
    if (email) {
      //send OTP using model
      const user = await User.findOne({ email: email });
      const receiver = user?.email;
      if (!receiver) {
        return res.status(401).send({ message: "User doesn't exists" });
      } else {
        const otp = CreateOTP();
        const savedOtp = await SaveOTP(receiver, otp);
        if (!savedOtp) {
          return res.status(401).send({ message: "Failed to send OTP" });
        }
        const subject = "Reset Your Password";
        const code = otp;
        const status = await SendEmail(receiver, subject, code);
        if (!status?.code === 200) {
          return res.status(401).send({ message: "User doesn't exists" });
        }
        logger.log("info", status);
        logger.log("info", `Password reset OTP sent to: ${receiver}`);
        return res
          .status(200)
          .send({ message: "Password reset OTP sent successfully" });
      }
    }
  } catch (err) {
    logger.log("error", err?.message);
    return res.status(500).send({ message: "Failed to reset user password" });
  }
};

// validate OTP using mongoose
const validateUserPasswordByOTP = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { otp, email } = data;

    // Check if the required fields are present in the request
    if (!otp || !email) {
      return res.status(400).send({ message: "All fields are required" });
    }

    //check if user exists
    const user = await User.findOne({ email: email });
    logger.log("info", JSON.stringify(user, null, 2));
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const otpMatch = await MatchOTP(email, otp);
    if (!otpMatch?.isMatch) {
      return res.status(401).send({ message: otpMatch?.message });
    } else {
      return res.status(200).send({ message: otpMatch?.message });
    }
  } catch (err) {
    logger.log("error", err?.message);
    return res.status(500).send({ message: "Failed to reset user password" });
  }
};

// update one user password by email OTP using mongoose
const updateUserPasswordByOTP = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { otp, email, newPassword } = data;

    // Check if the required fields are present in the request
    if (!otp || !email || !newPassword) {
      return res.status(400).send({ message: "All fields are required" });
    }

    //check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const otpMatch = await MatchOTP(email, otp);
    if (!otpMatch?.isMatch) {
      return res.status(401).send({ message: otpMatch?.message });
    }

    let updateData = {};
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    updateData = { password: hashedPassword };

    //update password using model
    const result = await User.findOneAndUpdate(
      { email: email },
      {
        $set: updateData,
      },
      { new: true } // To return the updated document
    );
    logger.log("info", JSON.stringify(result, null, 2));
    if (result?.modifiedCount === 0) {
      logger.log("info", `No modifications were made: ${email}`);
      return res.status(404).send({ message: "No modifications were made!" });
    } else {
      logger.log("info", `password updated for user: ${email}`);
      return res.send({ message: "password updated successfully!" });
    }
  } catch (err) {
    logger.log("error", err?.message);
    return res.status(500).send({ message: "Failed to reset user password" });
  }
};

// update one user password by OldPassword using mongoose
const updateUserPasswordByOldPassword = async (req, res) => {
  try {
    const email = req?.params?.email;
    const data = JSON.parse(req?.body?.data);
    const user = await User.findOne({ email: email });
    const { oldPassword, newPassword } = data;

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user?.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await User.findOneAndUpdate(
      { email: email },
      {
        $set: { password: hashedPassword },
      },
      { new: true } // To return the updated document
    );
    return res.send({ message: result });
  } catch (err) {
    logger.log("error", err?.message);
    return res.status(500).send({ message: "Failed to update user password" });
  }
};

// delete one user by id using mongoose
const deleteUserById = async (req, res) => {
  try {
    const id = req?.params?.id;
    //object id validation
    if (!ObjectId.isValid(id)) {
      logger.log("error", `Invalid ObjectId: ${id}`);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const userFromMiddleware = req?.user;
    logger.log("info", JSON.stringify(userFromMiddleware, null, 2));
    const hasAccess = AccessValidator(userFromMiddleware, id);
    logger.log("info", hasAccess);
    if (!hasAccess) {
      return res.status(401).send({
        message: "This user does not have access to perform this operation!",
      });
    }

    //delete using model
    // const result = await User.deleteOne({ _id: id });

    const result = UserCleanup(id);
    if (result?.deletedCount === 0) {
      logger.log("info", `No user found to delete with this id: ${id}`);
      return res.status(404).send({
        message: `No user found to delete with this id: ${id} `,
      });
    } else {
      logger.log("info", `User deleted: ${id}`);
      return res
        .status(200)
        .send({ message: `User deleted successfully with id: ${id} ` });
    }
  } catch (err) {
    logger.log("error", err?.message);
    return res.status(500).send({ message: "Failed to delete user" });
  }
};

module.exports = {
  getOneUser,
  getAllUsers,
  updateUserById,
  addOneLike,
  addOneWallpaperToMyWallpapers,
  removeOneWallpaperToMyWallpapers,
  sendPasswordResetOTP,
  validateUserPasswordByOTP,
  updateUserPasswordByOTP,
  RegisterUser,
  LoginUser,
  updateUserPasswordByOldPassword,
  deleteUserById,
};