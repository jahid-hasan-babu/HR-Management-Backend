import nodemailer from "nodemailer";

// Create reusable transporter ONCE (connection pooling)
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  pool: true, // Enable connection pooling
  maxConnections: 5, // Limit concurrent connections
  maxMessages: 100, // Messages per connection before reconnecting
  rateLimit: 10, // Max messages per second
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter ready");
  }
});

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string,
) => {
  const mailOptions = {
    from: `"ChatXChange" <no-reply@royalresin.uk>`,
    to,
    subject,
    html,
    text,
  };

  // Fire and forget - don't await in production for faster response
  transporter.sendMail(mailOptions).catch((err) => {
    console.error("❌ Email send error:", err);
  });
};

export default sendEmail;

// const sendEmail = async (
//   to: string,
//   subject: string,
//   html: string,
//   text?: string
// ) => {
//   // Create a transporter
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     port: 587,
//     secure: false,
//     auth: {
//       user: "support@teamupsports.gr",
//       pass: ">HL#G>Wmh!k7",
//       // user: "jahidhasanbabu657@gmail.com",
//       // pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // Email options
//   const mailOptions = {
//     from: "support@teamupsports.gr",
//     // from: "jahidhasanbabu657@gmail.com",
//     to,
//     subject,
//     html,
//     text,
//   };
//   await transporter.sendMail(mailOptions);
// };

// export default sendEmail;
