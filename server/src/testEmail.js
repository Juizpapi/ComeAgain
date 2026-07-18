import "dotenv/config";
import { sendEmail } from "./services/emailService.js";



console.log("HOST =", process.env.BREVO_HOST);
console.log("PORT =", process.env.BREVO_PORT);
console.log("USER =", process.env.BREVO_USER);
console.log("PASS exists =", !!process.env.BREVO_PASS);

try {
  await sendEmail({
    to: process.env.BREVO_USER,
    subject: "Come Again Restaurant Test",
    html: `
      <h2>Email Test Successful 🎉</h2>
      <p>Your Brevo email service is working correctly.</p>
    `,
  });

  console.log("✅ Test email sent successfully.");
} catch (error) {
  console.error("❌ Failed to send email:");
  console.error(error);
}