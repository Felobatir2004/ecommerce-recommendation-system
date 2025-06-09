export const welcomeTemplate = (name) => `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      padding: 0;
      margin: 0;
    }
    .email-container {
      max-width: 600px;
      margin: auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    .email-header {
      background: #007BFF;
      color: white;
      padding: 10px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .email-body {
      padding: 20px;
      color: #333;
    }
    .email-footer {
      text-align: center;
      font-size: 14px;
      color: #999;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Welcome to Shopop!</h1>
    </div>
    <div class="email-body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for registering at <strong>Shopop</strong>. We're excited to have you on board!</p>
      <p>Feel free to explore and enjoy our services.</p>
      <p>Best regards,<br />The Shopop Team</p>
    </div>
    <div class="email-footer">
      <p>&copy; 2025 Shopop. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
