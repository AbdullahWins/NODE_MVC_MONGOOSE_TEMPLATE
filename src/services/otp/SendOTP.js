const { SendEmail } = require("../emails/SendEmail");
const { logger } = require("../loggers/Winston");
const { CreateOTP } = require("./CreateOTP");
const { SaveOTP } = require("./SaveOTP");

const SendOTP = async ({ email, Model }) => {
  try {
    //validate inputs
    if (!email) {
      return { error: "Email is required" };
    }
    const user = await Model.findOne({ email });
    const receiver = user?.email;
    if (!receiver) {
      return { error: `${Model.modelName} doesn't exist` };
    } else {
      //create and save the otp
      const otp = CreateOTP();
      const savedOtp = await SaveOTP(receiver, otp);
      if (!savedOtp) {
        return { error: "Failed to send OTP" };
      }
      const subject = "Reset Your Password";
      const code = otp;
      //send the email
      const status = await SendEmail(receiver, subject, code);
      if (!status?.code === 200) {
        return { error: `${Model.modelName} doesn't exist` };
      }
      logger.log("info", `Password reset OTP sent to: ${receiver}`);
      return { message: "Password reset OTP sent successfully" };
    }
  } catch (error) {
    return { message: `Failed to reset ${Model.modelName} password` };
  }
};

exports.SendOTP = SendOTP;
