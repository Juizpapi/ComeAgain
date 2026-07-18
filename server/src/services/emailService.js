import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true only for port 465
  requireTLS: true,
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
    throw err;
  }
};