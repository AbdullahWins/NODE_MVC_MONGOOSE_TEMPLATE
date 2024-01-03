const jwt = require("jsonwebtoken");

const InitiateToken = (id, validity) => {
  const expiresIn = `${validity}d` || "7d";
  const token = jwt.sign({ id: id }, process.env.JWT_TOKEN_SECRET_KEY, {
    expiresIn,
  });
  return token;
};

module.exports = { InitiateToken };
