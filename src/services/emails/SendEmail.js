const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: process.env.SENDER_EMAIL_HOSTNAME,
  port: process.env.SENDER_EMAIL_PORT,
  auth: {
    user: process.env.SENDER_EMAIL_ID,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

const SendEmail = async (receiver, subject, code) => {
  try {
    // Read the HTML template file
    const emailTemplatePath = path.join(
      __dirname,
      "../../views/emails/ResetUserPassword.html"
    );
    const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

    // Replace placeholders in the template
    const formattedEmail = emailTemplate.replace("{{code}}", code);

    const info = await transporter.sendMail({
      from: `"Geniepers" <${process.env.SENDER_EMAIL_ID}>`,
      to: receiver,
      subject: subject,
      html: formattedEmail,
    });
    return info?.messageId;
  } catch (error) {
    return error?.message;
  }
};

module.exports = { SendEmail };
