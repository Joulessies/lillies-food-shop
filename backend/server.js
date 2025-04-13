const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configure CORS with specific options
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Test the email configuration on server start
transporter.verify(function (error, success) {
  if (error) {
    console.log("Email configuration error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

app.post("/api/send-email", async (req, res) => {
  try {
    const { orderDetails, customerEmail } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: "Order Confirmation - Lillies Food Shop",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0076f6;">Thank you for your order!</h2>
          <p>Dear ${orderDetails.customerInfo.name},</p>
          <p>We have received your order and it is being processed.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333;">Order Summary</h3>
            <ul style="list-style: none; padding: 0;">
              ${orderDetails.items
                .map(
                  (item) => `
                <li style="margin-bottom: 10px;">
                  <strong>${item.name}</strong> - ${item.quantity} x $${item.price}
                </li>
              `
                )
                .join("")}
            </ul>
            <p style="font-weight: bold; margin-top: 20px;">
              Total Amount: $${orderDetails.total}
            </p>
          </div>

          <div style="margin-top: 20px;">
            <h3>Delivery Details</h3>
            <p>Delivery Method: ${orderDetails.customerInfo.deliveryMethod}</p>
            <p>Phone: ${orderDetails.customerInfo.phone}</p>
            ${
              orderDetails.customerInfo.deliveryMethod === "delivery"
                ? `<p>Delivery Address: ${orderDetails.customerInfo.address}</p>`
                : "<p>Pickup at our store</p>"
            }
          </div>

          <p>We will notify you once your order is ready.</p>
          <p>If you have any questions, please contact us at hello@lilliesfoodshop.com</p>
          
          <p style="margin-top: 30px;">Best regards,<br>Lillies Food Shop Team</p>
        </div>
      `,
    };

    console.log("Attempting to send email to:", customerEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
