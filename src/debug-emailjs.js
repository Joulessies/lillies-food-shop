import emailjs from "@emailjs/browser";

// This is a debug file to test EmailJS directly
// You can run this with: node debug-emailjs.js

// Initialize EmailJS
emailjs.init("I-nhzq2Yd43TciJUH");

// Test function to send an email
const testSendEmail = async () => {
  try {
    const testEmail = "test@example.com";

    console.log("Testing EmailJS with email:", testEmail);

    // Test template parameters - include all possible recipient fields
    const testParams = {
      to_name: "Test Customer",
      from_name: "Lillies Food Shop",
      reply_to: testEmail,
      recipient: testEmail,
      to_email: testEmail,
      email: testEmail,
      user_email: testEmail,

      // Other template fields
      customer_name: "Test Customer",
      order_number: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      items: "Test Item x 1 - $10.00",
      total: "10.00",
      delivery_method: "pickup",
      phone: "555-1234",
      address: "Pickup at store",
    };

    console.log("Test parameters:", JSON.stringify(testParams, null, 2));

    // Test sending with EmailJS
    const response = await emailjs.send(
      "service_nqry9ul", // service ID
      "template_z9dl22q", // template ID
      testParams,
      "I-nhzq2Yd43TciJUH" // user ID (public key)
    );

    console.log("Email test succeeded:", response);
  } catch (error) {
    console.error("Email test failed:", error);
    console.error("Error details:", {
      text: error.text,
      message: error.message,
      status: error.status,
    });
  }
};

// Run the test
testSendEmail();
