const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1)create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // transporter.verify((error, success) => {
  //   if (error) {
  //     console.error("SMTP Connection Error:", error);
  //   } else {
  //     console.log("SMTP Server is ready to send emails");
  //   }
  // });
  //   2)Define the email options
  const mailOptions = {
    from: "Natours Support <ashik@nafeu.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) Actually send the email
  // try {
  //   await transporter.sendMail(mailOptions);
  //   console.log("Email sent successfully");
  // } catch (error) {
  //   console.error("Error sending email:", error);
  // }
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
