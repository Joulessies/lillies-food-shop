import emailjs from "@emailjs/browser";

// Initialize EmailJS with your public key
emailjs.init("I-nhzq2Yd43TciJUH");

// Email service that communicates with the backend
export const sendOrderConfirmation = async (orderDetails, customerEmail) => {
  try {
    // Basic validation
    if (!customerEmail || !customerEmail.includes("@")) {
      throw new Error("Invalid email address");
    }

    console.log("Preparing to send email to:", customerEmail);

    // Create template parameters based on the actual template fields from the screenshot
    const templateParams = {
      // Explicitly set EmailJS recipient field (different from template fields)
      to_email: customerEmail,
      to_name: orderDetails.customerInfo.name || "Customer",
      from_name: "Lillies Food Shop",
      reply_to: customerEmail,

      // Template fields
      order_id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      orders: orderDetails.items
        .map(
          (item) =>
            `${item.name} x ${item.quantity} - $${item.price * item.quantity}`
        )
        .join("\n"),
      image_url: "", // Not using this field for now
      name: orderDetails.customerInfo.name || "Customer",
      units: orderDetails.items
        .reduce((total, item) => total + item.quantity, 0)
        .toString(),
      price: orderDetails.total,
      cost: orderDetails.total, // Same as price for now
      email: customerEmail, // This is a field in the template
    };

    console.log(
      "Sending with params:",
      JSON.stringify(templateParams, null, 2)
    );

    // Try a different approach - create a form-like object for EmailJS
    const formElement = document.createElement("form");

    // Add recipient field explicitly
    const recipientField = document.createElement("input");
    recipientField.name = "to_email";
    recipientField.value = customerEmail;
    formElement.appendChild(recipientField);

    // Add all other parameters
    Object.entries(templateParams).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.name = key;
      input.value = value ? value.toString() : "";
      formElement.appendChild(input);
    });

    // Use sendForm instead of send
    const response = await emailjs.sendForm(
      "service_nqry9ul",
      "template_z9dl22q",
      formElement,
      "I-nhzq2Yd43TciJUH"
    );

    console.log("Email sent successfully:", response);

    return {
      success: true,
      message: "Order confirmation sent successfully",
    };
  } catch (error) {
    console.error("Email error:", error);
    throw new Error(`Failed to send email: ${error.text || error.message}`);
  }
};
