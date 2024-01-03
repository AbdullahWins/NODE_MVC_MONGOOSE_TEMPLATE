const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const stringPassword = password.toString();
    const hashedPassword = await bcrypt.hash(stringPassword, saltRounds);
    console.log(hashedPassword);
    return { success: true, hashedPassword };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to hash password!" };
  }
};

const comparePasswords = async ({ inputPassword, hashedPassword }) => {
  try {
    const stringInputPassword = inputPassword.toString();
    const stringHashedPassword = hashedPassword.toString();
    const passwordMatch = await bcrypt.compare(
      stringInputPassword,
      stringHashedPassword
    );
    if (!passwordMatch) {
      return { success: false, message: "Invalid password!" };
    } else {
      return { success: true, message: "Password matched!" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to compare passwords" };
  }
};

module.exports = { hashPassword, comparePasswords };
