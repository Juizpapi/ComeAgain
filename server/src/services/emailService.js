import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Come Again Restaurant" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Gmail Email Sent");
    console.log(info);

    return info;
  } catch (err) {
  console.error("❌ Gmail Error:");
  console.error(err);

  console.error("Code:", err.code);
  console.error("Command:", err.command);
  console.error("Response:", err.response);
  console.error("ResponseCode:", err.responseCode);

  throw err;
}
};