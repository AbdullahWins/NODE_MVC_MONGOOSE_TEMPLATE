//middleware to verify JWT
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const { logger } = require("../services/loggers/Winston");

const authorizeUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Unauthorized Access!" });
  }

  jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    const id = user?.id;
    const query = { _id: id };
    const userDoc = await User.findOne(query);
    if (!userDoc) {
      return res
        .status(401)
        .json({ message: "No valid user exists with the given token!" });
    }
    logger.log("info", `${userDoc?.email} is accessing the API!`);
    req.user = { ...userDoc, role: "user" };
    next();
  });
};

module.exports = { authorizeUser };
