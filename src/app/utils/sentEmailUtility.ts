
import nodemailer from "nodemailer";

const sentEmailUtility = async (
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Royal Resin" <no-reply@royalresin.uk>`,
    to,
    subject,
    html,
    text,
  };


  await transporter.sendMail(mailOptions);


};

export default sentEmailUtility;

