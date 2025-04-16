import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const EmailTest = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Sending...");

    try {
      emailjs.init("I-nhzq2Yd43TciJUH");

      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      console.log("Sending test email to:", email);

      const formElement = document.createElement("form");

      const recipientField = document.createElement("input");
      recipientField.name = "to_email";
      recipientField.value = email;
      formElement.appendChild(recipientField);

      const templateFields = {
        from_name: "Lillies Food Shop",
        to_name: "Test User",
        reply_to: email,

        order_id: `TEST-${Date.now()}`,
        orders: "Test Pizza x 1 - $1e.99\nTest Burger x 2 - $25.98",
        image_url: "",
        name: "Test Customer",
        units: "3",
        price: "41.97",
        cost: "41.97",
        email: email,
      };

      Object.entries(templateFields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.name = key;
        input.value = value ? value.toString() : "";
        formElement.appendChild(input);
      });

      console.log(
        "Sending with form fields:",
        Object.fromEntries(
          Array.from(formElement.elements).map((el) => [el.name, el.value]),
        ),
      );

      const response = await emailjs.sendForm(
        "service_nqry9ul",
        "template_z9dl22q",
        formElement,
        "I-nhzq2Yd43TciJUH",
      );

      console.log("Test email sent:", response);
      setStatus(`Success! Email sent to ${email}`);
    } catch (error) {
      console.error("Test email failed:", error);
      setStatus(`Error: ${error.text || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>EmailJS Test</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Email Address:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Sending..." : "Send Test Email"}
        </button>
      </form>

      {status && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: status.includes("Error") ? "#f8d7da" : "#d4edda",
            color: status.includes("Error") ? "#721c24" : "#155724",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default EmailTest;
