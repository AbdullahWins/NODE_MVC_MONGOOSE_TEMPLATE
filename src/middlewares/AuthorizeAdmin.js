//middleware to verify JWT
const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminModel");
const { logger } = require("../services/loggers/Winston");

const authorizeAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Unauthorized Access!" });
  }

  jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY, async (err, admin) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    const id = admin?.id;
    const query = { _id: id };
    const adminDoc = await Admin.findOne(query);
    if (!adminDoc) {
      return res
        .status(401)
        .json({ message: "No valid admin exists with the given token!" });
    }
    logger.log("info", `${adminDoc?.email} is accessing the API!`);
    req.admin = { ...adminDoc, role: "admin" };
    next();
  });
};

module.exports = { authorizeAdmin };
