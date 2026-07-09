import prisma from "../lib/prisma";
import sendEmail from "../utils/sendEmail";
import generateOTP from "./generateOtp";

export const sendOtpToGmail = async (existingUser: {
  email: string;
  id: string;
}) => {
  const otp = generateOTP();

  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME);
  const subject = "OTP Verification";
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OTP Verification</title>
</head>

<body style="margin:0; padding:0; background:#f4f6fb; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6fb; padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="background:#ffffff; border-radius:20px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background: linear-gradient(135deg, #2B2EBC, #3D42D9); padding:40px 20px;">

              <h1 style="margin:0; color:#ffffff; font-size:32px; font-weight:700;">
                OTP Verification
              </h1>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 30px; text-align:center;">

              <p style="font-size:18px; color:#333333; margin:0 0 15px;">
                Hello,
              </p>

              <p style="font-size:16px; color:#555555; margin:0 0 30px; line-height:1.6;">
                Use the OTP below to verify your account.
                This code will expire in 5 minutes.
              </p>

              <!-- OTP Box -->
              <div
                style="display:inline-block; background:#f4f6ff; border:2px dashed #2B2EBC; border-radius:16px; padding:18px 35px; margin-bottom:30px;">

                <span
                  style="font-size:40px; font-weight:700; letter-spacing:10px; color:#2B2EBC;">
                  ${otp}
                </span>

              </div>

              <p style="font-size:14px; color:#777777; line-height:1.6; margin:0 0 35px;">
                If you did not request this OTP, you can safely ignore this email.
              </p>

              <!-- Button -->
              <a href="#"
                style="display:inline-block;
                       width:280px;
                       background:linear-gradient(135deg, #2B2EBC, #3D42D9);
                       color:#ffffff;
                       text-decoration:none;
                       padding:16px 0;
                       border-radius:50px;
                       font-size:20px;
                       font-weight:600;
                       text-align:center;">
                Continue
              </a>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="padding:20px; background:#fafafa; border-top:1px solid #eeeeee;">

              <p style="margin:0; font-size:13px; color:#999999;">
                © 2026 Your Company Name. All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  // Fire email asynchronously - don't block response
  sendEmail(existingUser.email, subject, html);

  // Database operation - don't await if not needed for response
  prisma.otp
    .upsert({
      where: {
        userId: existingUser.id,
      },
      create: {
        userId: existingUser.id,
        expiresAt: expiresAt,
        otpCode: otp,
      },
      update: {
        otpCode: otp,
        expiresAt: expiresAt,
      },
    })
    .catch((err) => {
      console.error("❌ OTP save error:", err);
    });

  return otp;
};
