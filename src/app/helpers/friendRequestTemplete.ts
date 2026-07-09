export const friendRequestTemplate = (senderName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Friend Request Invitation</title>
  <style>
    body {
      background-color: #f4f7fb;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      background-color: #ffffff;
      margin: 40px auto;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .header {
      background-color: #4f46e5;
      color: #ffffff;
      text-align: center;
      padding: 30px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 25px;
      text-align: center;
      color: #333333;
    }
    .content h2 {
      font-size: 20px;
      color: #111827;
    }
    .content p {
      font-size: 16px;
      color: #4b5563;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #070711ff;
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 10px 5px;
    }
    .btn:hover {
      background-color: #4338ca;
    }
    .app-links {
      margin-top: 25px;
    }
    .app-links img {
      width: 150px;
      margin: 0 8px;
    }
    .footer {
      background-color: #f9fafb;
      text-align: center;
      padding: 15px;
      font-size: 13px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>👋 You’ve Got a Friend Request!</h1>
    </div>
    <div class="content">
      <h2>Hello there!</h2>
      <p>
        ${senderName || "Some One"}  wants to connect with you on <strong>Zeurkion</strong>.<br />
        If you’d like to become friends with this user, please download our app and create an account to accept the request.
      </p>

      <div class="app-links">
        <a href="https://play.google.com/store" target="_blank">
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play">
        </a>
        <a href="https://apps.apple.com/app" target="_blank">
          <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store">
        </a>
      </div>

      <p style="margin-top: 30px;">
        <a href="#" class="btn">Download Now</a>
      </p>
    </div>
    <div class="footer">
      © 2025 Zeurkion. All rights reserved.
    </div>
  </div>
</body>
</html>
`