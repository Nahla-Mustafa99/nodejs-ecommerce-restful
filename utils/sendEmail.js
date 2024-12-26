const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  // 1) Create transporter (service that will send the email like "gmail")
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: `E-shop App <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    text: text,
  };

  // Send the email.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
