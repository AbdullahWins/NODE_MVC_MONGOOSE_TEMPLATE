const jwt = require("jsonwebtoken");

const InitiateToken = (id) => {
  const validity = 30;
  const expiresIn = `${validity}d`;
  const token = jwt.sign({ id: id }, process.env.JWT_TOKEN_SECRET_KEY, {
    expiresIn,
  });
  return token;
};

module.exports = { InitiateToken };
