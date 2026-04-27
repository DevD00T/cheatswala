import nodemailer from "nodemailer";

const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAIL_SERVER,
      port: process.env.NODEMAIL_PORT,
      secure: false, // Set to true if using a secure connection (e.g., SMTPS)
      auth: {
        user: process.env.NODEMAIL_EMAIL,
        pass: process.env.NODEMAIL_PASSWORD,
      },
    });

    const email = {
      from: process.env.NODEMAIL_EMAIL,
      to: to,
      subject: subject,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .email-container {
                  width: 100%;
                  max-width: 600px;
                  margin: auto;
              }
              .header {
                  padding: 20px;
                  background-color: #19a572;
                  color: white;
                  text-align: center;
              }
              .content {
                  padding: 20px;
                  background-color: #fff;
              }
              .footer {
                  padding: 20px;
                  background-color: #eee;
                  text-align: center;
                  color: #777;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <h1>Cheatswala</h1>
              </div>
              <div class="content">
                  <h2>${subject}</h2>
                  <p>${message}</p>
              </div>
              <div class="footer">
                  &copy; 2023 Cheatswala. All rights reserved.
              </div>
          </div>
      </body>
      </html>`,
    };

    const emailResponse = await transporter.sendMail(email);
    if (emailResponse && emailResponse.messageId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default sendEmail;
